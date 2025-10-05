using Microsoft.Win32;
using System.IO;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media.Imaging;

namespace Shadeworks;

public partial class MainWindow : Window
{
    private BitmapImage? originalImage;
    private ImageProcessor? processor;

    public MainWindow()
    {
        InitializeComponent();
    }

    private void TitleBar_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
    {
        if (e.ClickCount == 2)
        {
            WindowState = WindowState == WindowState.Maximized ? WindowState.Normal : WindowState.Maximized;
        }
        else
        {
            DragMove();
        }
    }

    private void CloseButton_Click(object sender, MouseButtonEventArgs e)
    {
        Close();
    }

    private void MinimizeButton_Click(object sender, MouseButtonEventArgs e)
    {
        WindowState = WindowState.Minimized;
    }

    private void MaximizeButton_Click(object sender, MouseButtonEventArgs e)
    {
        WindowState = WindowState == WindowState.Maximized ? WindowState.Normal : WindowState.Maximized;
    }

    private void OpenImage_Click(object sender, RoutedEventArgs e)
    {
        var openFileDialog = new OpenFileDialog
        {
            Filter = "Image Files|*.jpg;*.jpeg;*.png;*.bmp;*.gif;*.tiff|All Files|*.*",
            Title = "Open Image"
        };

        if (openFileDialog.ShowDialog() == true)
        {
            try
            {
                originalImage = new BitmapImage(new Uri(openFileDialog.FileName));
                processor = new ImageProcessor(originalImage);
                PlaceholderText.Visibility = Visibility.Collapsed;
                ProcessImage();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error loading image: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
    }

    private void ExportImage_Click(object sender, RoutedEventArgs e)
    {
        if (ImagePreview.Source == null)
        {
            MessageBox.Show("No image to export!", "Error", MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        var saveFileDialog = new SaveFileDialog
        {
            Filter = "PNG Image|*.png|JPEG Image|*.jpg|BMP Image|*.bmp|TIFF Image|*.tiff",
            Title = "Export Image",
            FileName = "shadeworks_output"
        };

        if (saveFileDialog.ShowDialog() == true)
        {
            try
            {
                var encoder = GetEncoder(saveFileDialog.FileName);
                encoder.Frames.Add(BitmapFrame.Create((BitmapSource)ImagePreview.Source));

                using var stream = new FileStream(saveFileDialog.FileName, FileMode.Create);
                encoder.Save(stream);

                MessageBox.Show("Image exported successfully!", "Success", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error exporting image: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
    }

    private BitmapEncoder GetEncoder(string filename)
    {
        var extension = Path.GetExtension(filename).ToLower();
        return extension switch
        {
            ".png" => new PngBitmapEncoder(),
            ".jpg" or ".jpeg" => new JpegBitmapEncoder { QualityLevel = 95 },
            ".bmp" => new BmpBitmapEncoder(),
            ".tiff" => new TiffBitmapEncoder(),
            _ => new PngBitmapEncoder()
        };
    }

    private void DitherAlgorithm_Changed(object sender, System.Windows.Controls.SelectionChangedEventArgs e)
    {
        ProcessImage();
    }

    private void ImageParameter_Changed(object sender, RoutedEventArgs e)
    {
        ProcessImage();
    }

    private void ResetAll_Click(object sender, RoutedEventArgs e)
    {
        BrightnessSlider.Value = 0;
        ContrastSlider.Value = 0;
        SaturationSlider.Value = 0;
        ColorCountSlider.Value = 2;
        GrayscaleCheckBox.IsChecked = false;
        InvertCheckBox.IsChecked = false;
        DitherAlgorithmComboBox.SelectedIndex = 0;
    }

    private async void ProcessImage()
    {
        if (processor == null || originalImage == null)
            return;

        try
        {
            var ditherType = ((System.Windows.Controls.ComboBoxItem)DitherAlgorithmComboBox.SelectedItem)?.Content?.ToString() ?? "None";
            
            var settings = new ImageProcessingSettings
            {
                DitherAlgorithm = ditherType,
                ColorCount = (int)ColorCountSlider.Value,
                Brightness = (int)BrightnessSlider.Value,
                Contrast = (int)ContrastSlider.Value,
                Saturation = (int)SaturationSlider.Value,
                Grayscale = GrayscaleCheckBox.IsChecked == true,
                Invert = InvertCheckBox.IsChecked == true
            };

            var processed = await Task.Run(() => processor.Process(settings));
            ImagePreview.Source = processed;
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Error processing image: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }
}

