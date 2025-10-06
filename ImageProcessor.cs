using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;
using System.Windows.Media.Imaging;

namespace Shadeworks;

public class ImageProcessingSettings
{
    public string DitherAlgorithm { get; set; } = "None";
    public int ColorCount { get; set; } = 2;
    public int Brightness { get; set; } = 0;
    public int Contrast { get; set; } = 0;
    public int Saturation { get; set; } = 0;
    public bool Grayscale { get; set; } = false;
    public bool Invert { get; set; } = false;
}

public class ImageProcessor
{
    private readonly Bitmap originalBitmap;

    public ImageProcessor(BitmapImage bitmapImage)
    {
        originalBitmap = BitmapImageToBitmap(bitmapImage);
    }

    public BitmapImage Process(ImageProcessingSettings settings)
    {
        var workingBitmap = new Bitmap(originalBitmap);

        try
        {
            // Apply adjustments
            if (settings.Brightness != 0 || settings.Contrast != 0 || settings.Saturation != 0)
            {
                ApplyAdjustments(workingBitmap, settings.Brightness, settings.Contrast, settings.Saturation);
            }

            // Apply grayscale
            if (settings.Grayscale)
            {
                ApplyGrayscale(workingBitmap);
            }

            // Apply invert
            if (settings.Invert)
            {
                ApplyInvert(workingBitmap);
            }

            // Apply dithering
            switch (settings.DitherAlgorithm)
            {
                case "Floyd-Steinberg":
                    ApplyFloydSteinberg(workingBitmap, settings.ColorCount);
                    break;
                case "Atkinson":
                    ApplyAtkinson(workingBitmap, settings.ColorCount);
                    break;
                case "Bayer 2x2":
                    ApplyBayerDither(workingBitmap, 2, settings.ColorCount);
                    break;
                case "Bayer 4x4":
                    ApplyBayerDither(workingBitmap, 4, settings.ColorCount);
                    break;
                case "Bayer 8x8":
                    ApplyBayerDither(workingBitmap, 8, settings.ColorCount);
                    break;
                case "Stucki":
                    ApplyStucki(workingBitmap, settings.ColorCount);
                    break;
                case "Jarvis-Judice-Ninke":
                    ApplyJarvisJudiceNinke(workingBitmap, settings.ColorCount);
                    break;
                case "Sierra":
                    ApplySierra(workingBitmap, settings.ColorCount);
                    break;
                case "Sierra Lite":
                    ApplySierraLite(workingBitmap, settings.ColorCount);
                    break;
                case "Burkes":
                    ApplyBurkes(workingBitmap, settings.ColorCount);
                    break;
            }

            var result = BitmapToBitmapImage(workingBitmap);
            return result;
        }
        finally
        {
            workingBitmap?.Dispose();
        }
    }

    private void ApplyAdjustments(Bitmap bitmap, int brightness, int contrast, int saturation)
    {
        var rect = new Rectangle(0, 0, bitmap.Width, bitmap.Height);
        var bmpData = bitmap.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format24bppRgb);
        var ptr = bmpData.Scan0;
        var bytes = Math.Abs(bmpData.Stride) * bitmap.Height;
        var rgbValues = new byte[bytes];
        Marshal.Copy(ptr, rgbValues, 0, bytes);

        double contrastFactor = (259.0 * (contrast + 255.0)) / (255.0 * (259.0 - contrast));
        double saturationFactor = (saturation + 100.0) / 100.0;

        for (int i = 0; i < rgbValues.Length; i += 3)
        {
            int b = rgbValues[i];
            int g = rgbValues[i + 1];
            int r = rgbValues[i + 2];

            // Brightness
            r += brightness;
            g += brightness;
            b += brightness;

            // Contrast
            r = Clamp((int)(contrastFactor * (r - 128) + 128));
            g = Clamp((int)(contrastFactor * (g - 128) + 128));
            b = Clamp((int)(contrastFactor * (b - 128) + 128));

            // Saturation
            double gray = 0.299 * r + 0.587 * g + 0.114 * b;
            r = Clamp((int)(gray + (r - gray) * saturationFactor));
            g = Clamp((int)(gray + (g - gray) * saturationFactor));
            b = Clamp((int)(gray + (b - gray) * saturationFactor));

            rgbValues[i] = (byte)b;
            rgbValues[i + 1] = (byte)g;
            rgbValues[i + 2] = (byte)r;
        }

        Marshal.Copy(rgbValues, 0, ptr, bytes);
        bitmap.UnlockBits(bmpData);
    }

    private void ApplyGrayscale(Bitmap bitmap)
    {
        for (int y = 0; y < bitmap.Height; y++)
        {
            for (int x = 0; x < bitmap.Width; x++)
            {
                var pixel = bitmap.GetPixel(x, y);
                int gray = (int)(pixel.R * 0.299 + pixel.G * 0.587 + pixel.B * 0.114);
                bitmap.SetPixel(x, y, Color.FromArgb(pixel.A, gray, gray, gray));
            }
        }
    }

    private void ApplyInvert(Bitmap bitmap)
    {
        for (int y = 0; y < bitmap.Height; y++)
        {
            for (int x = 0; x < bitmap.Width; x++)
            {
                var pixel = bitmap.GetPixel(x, y);
                bitmap.SetPixel(x, y, Color.FromArgb(pixel.A, 255 - pixel.R, 255 - pixel.G, 255 - pixel.B));
            }
        }
    }

    private void ApplyFloydSteinberg(Bitmap bitmap, int colorCount)
    {
        int[,] errors = new int[bitmap.Width, 3];
        
        for (int y = 0; y < bitmap.Height; y++)
        {
            int[,] nextErrors = new int[bitmap.Width, 3];
            
            for (int x = 0; x < bitmap.Width; x++)
            {
                var oldPixel = bitmap.GetPixel(x, y);
                int r = Clamp(oldPixel.R + errors[x, 0]);
                int g = Clamp(oldPixel.G + errors[x, 1]);
                int b = Clamp(oldPixel.B + errors[x, 2]);
                
                var newColor = FindClosestPaletteColor(Color.FromArgb(r, g, b), colorCount);
                bitmap.SetPixel(x, y, newColor);
                
                int errR = r - newColor.R;
                int errG = g - newColor.G;
                int errB = b - newColor.B;
                
                if (x + 1 < bitmap.Width)
                {
                    errors[x + 1, 0] += errR * 7 / 16;
                    errors[x + 1, 1] += errG * 7 / 16;
                    errors[x + 1, 2] += errB * 7 / 16;
                }
                
                if (x > 0)
                {
                    nextErrors[x - 1, 0] += errR * 3 / 16;
                    nextErrors[x - 1, 1] += errG * 3 / 16;
                    nextErrors[x - 1, 2] += errB * 3 / 16;
                }
                
                nextErrors[x, 0] += errR * 5 / 16;
                nextErrors[x, 1] += errG * 5 / 16;
                nextErrors[x, 2] += errB * 5 / 16;
                
                if (x + 1 < bitmap.Width)
                {
                    nextErrors[x + 1, 0] += errR * 1 / 16;
                    nextErrors[x + 1, 1] += errG * 1 / 16;
                    nextErrors[x + 1, 2] += errB * 1 / 16;
                }
            }
            
            errors = nextErrors;
        }
    }

    private void ApplyAtkinson(Bitmap bitmap, int colorCount)
    {
        int[,,] errors = new int[bitmap.Height + 2, bitmap.Width + 2, 3];
        
        for (int y = 0; y < bitmap.Height; y++)
        {
            for (int x = 0; x < bitmap.Width; x++)
            {
                var oldPixel = bitmap.GetPixel(x, y);
                int r = Clamp(oldPixel.R + errors[y, x, 0]);
                int g = Clamp(oldPixel.G + errors[y, x, 1]);
                int b = Clamp(oldPixel.B + errors[y, x, 2]);
                
                var newColor = FindClosestPaletteColor(Color.FromArgb(r, g, b), colorCount);
                bitmap.SetPixel(x, y, newColor);
                
                int errR = (r - newColor.R) / 8;
                int errG = (g - newColor.G) / 8;
                int errB = (b - newColor.B) / 8;
                
                // Atkinson dithering pattern
                if (x + 1 < bitmap.Width)
                {
                    errors[y, x + 1, 0] += errR;
                    errors[y, x + 1, 1] += errG;
                    errors[y, x + 1, 2] += errB;
                }
                if (x + 2 < bitmap.Width)
                {
                    errors[y, x + 2, 0] += errR;
                    errors[y, x + 2, 1] += errG;
                    errors[y, x + 2, 2] += errB;
                }
                if (y + 1 < bitmap.Height)
                {
                    if (x > 0)
                    {
                        errors[y + 1, x - 1, 0] += errR;
                        errors[y + 1, x - 1, 1] += errG;
                        errors[y + 1, x - 1, 2] += errB;
                    }
                    errors[y + 1, x, 0] += errR;
                    errors[y + 1, x, 1] += errG;
                    errors[y + 1, x, 2] += errB;
                    if (x + 1 < bitmap.Width)
                    {
                        errors[y + 1, x + 1, 0] += errR;
                        errors[y + 1, x + 1, 1] += errG;
                        errors[y + 1, x + 1, 2] += errB;
                    }
                }
                if (y + 2 < bitmap.Height)
                {
                    errors[y + 2, x, 0] += errR;
                    errors[y + 2, x, 1] += errG;
                    errors[y + 2, x, 2] += errB;
                }
            }
        }
    }

    private void ApplyBayerDither(Bitmap bitmap, int matrixSize, int colorCount)
    {
        int[,] bayerMatrix = matrixSize switch
        {
            2 => new[,] { { 0, 2 }, { 3, 1 } },
            4 => new[,] {
                { 0, 8, 2, 10 },
                { 12, 4, 14, 6 },
                { 3, 11, 1, 9 },
                { 15, 7, 13, 5 }
            },
            8 => new[,] {
                { 0, 32, 8, 40, 2, 34, 10, 42 },
                { 48, 16, 56, 24, 50, 18, 58, 26 },
                { 12, 44, 4, 36, 14, 46, 6, 38 },
                { 60, 28, 52, 20, 62, 30, 54, 22 },
                { 3, 35, 11, 43, 1, 33, 9, 41 },
                { 51, 19, 59, 27, 49, 17, 57, 25 },
                { 15, 47, 7, 39, 13, 45, 5, 37 },
                { 63, 31, 55, 23, 61, 29, 53, 21 }
            },
            _ => new[,] { { 0, 2 }, { 3, 1 } }
        };

        double scale = (matrixSize * matrixSize);
        
        for (int y = 0; y < bitmap.Height; y++)
        {
            for (int x = 0; x < bitmap.Width; x++)
            {
                var pixel = bitmap.GetPixel(x, y);
                double threshold = (bayerMatrix[y % matrixSize, x % matrixSize] / scale - 0.5) * 255;
                
                int r = Clamp((int)(pixel.R + threshold));
                int g = Clamp((int)(pixel.G + threshold));
                int b = Clamp((int)(pixel.B + threshold));
                
                var newColor = FindClosestPaletteColor(Color.FromArgb(r, g, b), colorCount);
                bitmap.SetPixel(x, y, newColor);
            }
        }
    }

    private void ApplyStucki(Bitmap bitmap, int colorCount)
    {
        int[,,] errors = new int[bitmap.Height + 2, bitmap.Width + 4, 3];
        
        for (int y = 0; y < bitmap.Height; y++)
        {
            for (int x = 0; x < bitmap.Width; x++)
            {
                var oldPixel = bitmap.GetPixel(x, y);
                int r = Clamp(oldPixel.R + errors[y, x + 2, 0]);
                int g = Clamp(oldPixel.G + errors[y, x + 2, 1]);
                int b = Clamp(oldPixel.B + errors[y, x + 2, 2]);
                
                var newColor = FindClosestPaletteColor(Color.FromArgb(r, g, b), colorCount);
                bitmap.SetPixel(x, y, newColor);
                
                int errR = r - newColor.R;
                int errG = g - newColor.G;
                int errB = b - newColor.B;
                
                // Stucki dithering pattern
                errors[y, x + 3, 0] += errR * 8 / 42;
                errors[y, x + 3, 1] += errG * 8 / 42;
                errors[y, x + 3, 2] += errB * 8 / 42;
                
                errors[y, x + 4, 0] += errR * 4 / 42;
                errors[y, x + 4, 1] += errG * 4 / 42;
                errors[y, x + 4, 2] += errB * 4 / 42;
                
                if (y + 1 < bitmap.Height)
                {
                    errors[y + 1, x, 0] += errR * 2 / 42;
                    errors[y + 1, x, 1] += errG * 2 / 42;
                    errors[y + 1, x, 2] += errB * 2 / 42;
                    
                    errors[y + 1, x + 1, 0] += errR * 4 / 42;
                    errors[y + 1, x + 1, 1] += errG * 4 / 42;
                    errors[y + 1, x + 1, 2] += errB * 4 / 42;
                    
                    errors[y + 1, x + 2, 0] += errR * 8 / 42;
                    errors[y + 1, x + 2, 1] += errG * 8 / 42;
                    errors[y + 1, x + 2, 2] += errB * 8 / 42;
                    
                    errors[y + 1, x + 3, 0] += errR * 4 / 42;
                    errors[y + 1, x + 3, 1] += errG * 4 / 42;
                    errors[y + 1, x + 3, 2] += errB * 4 / 42;
                    
                    errors[y + 1, x + 4, 0] += errR * 2 / 42;
                    errors[y + 1, x + 4, 1] += errG * 2 / 42;
                    errors[y + 1, x + 4, 2] += errB * 2 / 42;
                }
                
                if (y + 2 < bitmap.Height)
                {
                    errors[y + 2, x, 0] += errR * 1 / 42;
                    errors[y + 2, x, 1] += errG * 1 / 42;
                    errors[y + 2, x, 2] += errB * 1 / 42;
                    
                    errors[y + 2, x + 1, 0] += errR * 2 / 42;
                    errors[y + 2, x + 1, 1] += errG * 2 / 42;
                    errors[y + 2, x + 1, 2] += errB * 2 / 42;
                    
                    errors[y + 2, x + 2, 0] += errR * 4 / 42;
                    errors[y + 2, x + 2, 1] += errG * 4 / 42;
                    errors[y + 2, x + 2, 2] += errB * 4 / 42;
                    
                    errors[y + 2, x + 3, 0] += errR * 2 / 42;
                    errors[y + 2, x + 3, 1] += errG * 2 / 42;
                    errors[y + 2, x + 3, 2] += errB * 2 / 42;
                    
                    errors[y + 2, x + 4, 0] += errR * 1 / 42;
                    errors[y + 2, x + 4, 1] += errG * 1 / 42;
                    errors[y + 2, x + 4, 2] += errB * 1 / 42;
                }
            }
        }
    }

    private void ApplyJarvisJudiceNinke(Bitmap bitmap, int colorCount)
    {
        int[,,] errors = new int[bitmap.Height + 2, bitmap.Width + 4, 3];
        
        for (int y = 0; y < bitmap.Height; y++)
        {
            for (int x = 0; x < bitmap.Width; x++)
            {
                var oldPixel = bitmap.GetPixel(x, y);
                int r = Clamp(oldPixel.R + errors[y, x + 2, 0]);
                int g = Clamp(oldPixel.G + errors[y, x + 2, 1]);
                int b = Clamp(oldPixel.B + errors[y, x + 2, 2]);
                
                var newColor = FindClosestPaletteColor(Color.FromArgb(r, g, b), colorCount);
                bitmap.SetPixel(x, y, newColor);
                
                int errR = r - newColor.R;
                int errG = g - newColor.G;
                int errB = b - newColor.B;
                
                // Jarvis-Judice-Ninke pattern
                errors[y, x + 3, 0] += errR * 7 / 48;
                errors[y, x + 3, 1] += errG * 7 / 48;
                errors[y, x + 3, 2] += errB * 7 / 48;
                
                errors[y, x + 4, 0] += errR * 5 / 48;
                errors[y, x + 4, 1] += errG * 5 / 48;
                errors[y, x + 4, 2] += errB * 5 / 48;
                
                if (y + 1 < bitmap.Height)
                {
                    errors[y + 1, x, 0] += errR * 3 / 48;
                    errors[y + 1, x, 1] += errG * 3 / 48;
                    errors[y + 1, x, 2] += errB * 3 / 48;
                    
                    errors[y + 1, x + 1, 0] += errR * 5 / 48;
                    errors[y + 1, x + 1, 1] += errG * 5 / 48;
                    errors[y + 1, x + 1, 2] += errB * 5 / 48;
                    
                    errors[y + 1, x + 2, 0] += errR * 7 / 48;
                    errors[y + 1, x + 2, 1] += errG * 7 / 48;
                    errors[y + 1, x + 2, 2] += errB * 7 / 48;
                    
                    errors[y + 1, x + 3, 0] += errR * 5 / 48;
                    errors[y + 1, x + 3, 1] += errG * 5 / 48;
                    errors[y + 1, x + 3, 2] += errB * 5 / 48;
                    
                    errors[y + 1, x + 4, 0] += errR * 3 / 48;
                    errors[y + 1, x + 4, 1] += errG * 3 / 48;
                    errors[y + 1, x + 4, 2] += errB * 3 / 48;
                }
                
                if (y + 2 < bitmap.Height)
                {
                    errors[y + 2, x, 0] += errR * 1 / 48;
                    errors[y + 2, x, 1] += errG * 1 / 48;
                    errors[y + 2, x, 2] += errB * 1 / 48;
                    
                    errors[y + 2, x + 1, 0] += errR * 3 / 48;
                    errors[y + 2, x + 1, 1] += errG * 3 / 48;
                    errors[y + 2, x + 1, 2] += errB * 3 / 48;
                    
                    errors[y + 2, x + 2, 0] += errR * 5 / 48;
                    errors[y + 2, x + 2, 1] += errG * 5 / 48;
                    errors[y + 2, x + 2, 2] += errB * 5 / 48;
                    
                    errors[y + 2, x + 3, 0] += errR * 3 / 48;
                    errors[y + 2, x + 3, 1] += errG * 3 / 48;
                    errors[y + 2, x + 3, 2] += errB * 3 / 48;
                    
                    errors[y + 2, x + 4, 0] += errR * 1 / 48;
                    errors[y + 2, x + 4, 1] += errG * 1 / 48;
                    errors[y + 2, x + 4, 2] += errB * 1 / 48;
                }
            }
        }
    }

    private void ApplySierra(Bitmap bitmap, int colorCount)
    {
        int[,,] errors = new int[bitmap.Height + 2, bitmap.Width + 4, 3];
        
        for (int y = 0; y < bitmap.Height; y++)
        {
            for (int x = 0; x < bitmap.Width; x++)
            {
                var oldPixel = bitmap.GetPixel(x, y);
                int r = Clamp(oldPixel.R + errors[y, x + 2, 0]);
                int g = Clamp(oldPixel.G + errors[y, x + 2, 1]);
                int b = Clamp(oldPixel.B + errors[y, x + 2, 2]);
                
                var newColor = FindClosestPaletteColor(Color.FromArgb(r, g, b), colorCount);
                bitmap.SetPixel(x, y, newColor);
                
                int errR = r - newColor.R;
                int errG = g - newColor.G;
                int errB = b - newColor.B;
                
                // Sierra pattern
                errors[y, x + 3, 0] += errR * 5 / 32;
                errors[y, x + 3, 1] += errG * 5 / 32;
                errors[y, x + 3, 2] += errB * 5 / 32;
                
                errors[y, x + 4, 0] += errR * 3 / 32;
                errors[y, x + 4, 1] += errG * 3 / 32;
                errors[y, x + 4, 2] += errB * 3 / 32;
                
                if (y + 1 < bitmap.Height)
                {
                    errors[y + 1, x, 0] += errR * 2 / 32;
                    errors[y + 1, x, 1] += errG * 2 / 32;
                    errors[y + 1, x, 2] += errB * 2 / 32;
                    
                    errors[y + 1, x + 1, 0] += errR * 4 / 32;
                    errors[y + 1, x + 1, 1] += errG * 4 / 32;
                    errors[y + 1, x + 1, 2] += errB * 4 / 32;
                    
                    errors[y + 1, x + 2, 0] += errR * 5 / 32;
                    errors[y + 1, x + 2, 1] += errG * 5 / 32;
                    errors[y + 1, x + 2, 2] += errB * 5 / 32;
                    
                    errors[y + 1, x + 3, 0] += errR * 4 / 32;
                    errors[y + 1, x + 3, 1] += errG * 4 / 32;
                    errors[y + 1, x + 3, 2] += errB * 4 / 32;
                    
                    errors[y + 1, x + 4, 0] += errR * 2 / 32;
                    errors[y + 1, x + 4, 1] += errG * 2 / 32;
                    errors[y + 1, x + 4, 2] += errB * 2 / 32;
                }
                
                if (y + 2 < bitmap.Height)
                {
                    errors[y + 2, x + 1, 0] += errR * 2 / 32;
                    errors[y + 2, x + 1, 1] += errG * 2 / 32;
                    errors[y + 2, x + 1, 2] += errB * 2 / 32;
                    
                    errors[y + 2, x + 2, 0] += errR * 3 / 32;
                    errors[y + 2, x + 2, 1] += errG * 3 / 32;
                    errors[y + 2, x + 2, 2] += errB * 3 / 32;
                    
                    errors[y + 2, x + 3, 0] += errR * 2 / 32;
                    errors[y + 2, x + 3, 1] += errG * 2 / 32;
                    errors[y + 2, x + 3, 2] += errB * 2 / 32;
                }
            }
        }
    }

    private void ApplySierraLite(Bitmap bitmap, int colorCount)
    {
        int[,] errors = new int[bitmap.Width, 3];
        
        for (int y = 0; y < bitmap.Height; y++)
        {
            int[,] nextErrors = new int[bitmap.Width, 3];
            
            for (int x = 0; x < bitmap.Width; x++)
            {
                var oldPixel = bitmap.GetPixel(x, y);
                int r = Clamp(oldPixel.R + errors[x, 0]);
                int g = Clamp(oldPixel.G + errors[x, 1]);
                int b = Clamp(oldPixel.B + errors[x, 2]);
                
                var newColor = FindClosestPaletteColor(Color.FromArgb(r, g, b), colorCount);
                bitmap.SetPixel(x, y, newColor);
                
                int errR = r - newColor.R;
                int errG = g - newColor.G;
                int errB = b - newColor.B;
                
                if (x + 1 < bitmap.Width)
                {
                    errors[x + 1, 0] += errR * 2 / 4;
                    errors[x + 1, 1] += errG * 2 / 4;
                    errors[x + 1, 2] += errB * 2 / 4;
                }
                
                if (x > 0)
                {
                    nextErrors[x - 1, 0] += errR * 1 / 4;
                    nextErrors[x - 1, 1] += errG * 1 / 4;
                    nextErrors[x - 1, 2] += errB * 1 / 4;
                }
                
                nextErrors[x, 0] += errR * 1 / 4;
                nextErrors[x, 1] += errG * 1 / 4;
                nextErrors[x, 2] += errB * 1 / 4;
            }
            
            errors = nextErrors;
        }
    }

    private void ApplyBurkes(Bitmap bitmap, int colorCount)
    {
        int[,,] errors = new int[bitmap.Height + 1, bitmap.Width + 4, 3];
        
        for (int y = 0; y < bitmap.Height; y++)
        {
            for (int x = 0; x < bitmap.Width; x++)
            {
                var oldPixel = bitmap.GetPixel(x, y);
                int r = Clamp(oldPixel.R + errors[y, x + 2, 0]);
                int g = Clamp(oldPixel.G + errors[y, x + 2, 1]);
                int b = Clamp(oldPixel.B + errors[y, x + 2, 2]);
                
                var newColor = FindClosestPaletteColor(Color.FromArgb(r, g, b), colorCount);
                bitmap.SetPixel(x, y, newColor);
                
                int errR = r - newColor.R;
                int errG = g - newColor.G;
                int errB = b - newColor.B;
                
                // Burkes pattern
                errors[y, x + 3, 0] += errR * 8 / 32;
                errors[y, x + 3, 1] += errG * 8 / 32;
                errors[y, x + 3, 2] += errB * 8 / 32;
                
                errors[y, x + 4, 0] += errR * 4 / 32;
                errors[y, x + 4, 1] += errG * 4 / 32;
                errors[y, x + 4, 2] += errB * 4 / 32;
                
                if (y + 1 < bitmap.Height)
                {
                    errors[y + 1, x, 0] += errR * 2 / 32;
                    errors[y + 1, x, 1] += errG * 2 / 32;
                    errors[y + 1, x, 2] += errB * 2 / 32;
                    
                    errors[y + 1, x + 1, 0] += errR * 4 / 32;
                    errors[y + 1, x + 1, 1] += errG * 4 / 32;
                    errors[y + 1, x + 1, 2] += errB * 4 / 32;
                    
                    errors[y + 1, x + 2, 0] += errR * 8 / 32;
                    errors[y + 1, x + 2, 1] += errG * 8 / 32;
                    errors[y + 1, x + 2, 2] += errB * 8 / 32;
                    
                    errors[y + 1, x + 3, 0] += errR * 4 / 32;
                    errors[y + 1, x + 3, 1] += errG * 4 / 32;
                    errors[y + 1, x + 3, 2] += errB * 4 / 32;
                    
                    errors[y + 1, x + 4, 0] += errR * 2 / 32;
                    errors[y + 1, x + 4, 1] += errG * 2 / 32;
                    errors[y + 1, x + 4, 2] += errB * 2 / 32;
                }
            }
        }
    }

    private Color FindClosestPaletteColor(Color color, int colorCount)
    {
        int paletteSize = colorCount - 1;
        int r = (int)Math.Round((double)color.R / 255 * paletteSize) * (255 / paletteSize);
        int g = (int)Math.Round((double)color.G / 255 * paletteSize) * (255 / paletteSize);
        int b = (int)Math.Round((double)color.B / 255 * paletteSize) * (255 / paletteSize);
        return Color.FromArgb(Clamp(r), Clamp(g), Clamp(b));
    }

    private int Clamp(int value) => Math.Max(0, Math.Min(255, value));

    private Bitmap BitmapImageToBitmap(BitmapImage bitmapImage)
    {
        using var outStream = new MemoryStream();
        BitmapEncoder enc = new BmpBitmapEncoder();
        enc.Frames.Add(BitmapFrame.Create(bitmapImage));
        enc.Save(outStream);
        var bitmap = new Bitmap(outStream);
        return new Bitmap(bitmap);
    }

    private BitmapImage BitmapToBitmapImage(Bitmap bitmap)
    {
        var memory = new MemoryStream();
        bitmap.Save(memory, ImageFormat.Png);
        memory.Position = 0;
        var bitmapImage = new BitmapImage();
        bitmapImage.BeginInit();
        bitmapImage.StreamSource = memory;
        bitmapImage.CacheOption = BitmapCacheOption.OnLoad;
        bitmapImage.EndInit();
        bitmapImage.Freeze();
        memory.Dispose();
        return bitmapImage;
    }
}

