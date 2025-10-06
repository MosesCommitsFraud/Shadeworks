using Microsoft.Win32;
using System.IO;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media.Imaging;
using System.Windows.Controls;

namespace Shadeworks;

public partial class MainWindow : Window
{
    private BitmapImage? originalImage;
    private ImageProcessor? processor;
    private double zoomLevel = 1.0;
    private const double ZoomIncrement = 0.1;
    private const double MinZoom = 0.1;
    private const double MaxZoom = 10.0;
    private Point? lastMousePosition;
    private bool isPanning = false;
    private bool isProcessing = false;

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
                ResetZoom();
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
        System.Diagnostics.Debug.WriteLine("ImageParameter_Changed called");
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
        System.Diagnostics.Debug.WriteLine($"ProcessImage called. Processor null? {processor == null}, Image null? {originalImage == null}, IsProcessing? {isProcessing}");
        
        if (processor == null || originalImage == null || isProcessing)
        {
            System.Diagnostics.Debug.WriteLine("ProcessImage exited early");
            return;
        }

        isProcessing = true;
        System.Diagnostics.Debug.WriteLine("Starting image processing...");

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

            System.Diagnostics.Debug.WriteLine($"Settings: Brightness={settings.Brightness}, Contrast={settings.Contrast}");

            var processed = await Task.Run(() => processor.Process(settings));
            
            System.Diagnostics.Debug.WriteLine("Processing complete, updating UI");
            
            Dispatcher.Invoke(() =>
            {
                ImagePreview.Source = processed;
                System.Diagnostics.Debug.WriteLine("Image source updated");
            });
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error: {ex.Message}\n{ex.StackTrace}");
            Dispatcher.Invoke(() =>
            {
                MessageBox.Show($"Error processing image: {ex.Message}\n\nStack trace:\n{ex.StackTrace}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            });
        }
        finally
        {
            isProcessing = false;
            System.Diagnostics.Debug.WriteLine("ProcessImage finished");
        }
    }

    private void ImageScrollViewer_MouseWheel(object sender, MouseWheelEventArgs e)
    {
        System.Diagnostics.Debug.WriteLine($"MouseWheel: Delta={e.Delta}, Modifiers={Keyboard.Modifiers}");
        
        // Check if Alt key is pressed for zooming
        if (Keyboard.Modifiers == ModifierKeys.Alt)
        {
            e.Handled = true;
            System.Diagnostics.Debug.WriteLine("Alt key detected, zooming");

            // Get mouse position relative to the image container
            Point mousePos = e.GetPosition(ImageBorder);
            
            // Store old zoom
            double oldZoom = zoomLevel;

            double zoomDelta = e.Delta > 0 ? ZoomIncrement : -ZoomIncrement;
            double newZoom = Math.Max(MinZoom, Math.Min(MaxZoom, zoomLevel + zoomDelta));

            if (newZoom != oldZoom)
            {
                // Calculate the point in the image before zoom
                double pointX = mousePos.X;
                double pointY = mousePos.Y;
                
                zoomLevel = newZoom;
                ImageScaleTransform.ScaleX = zoomLevel;
                ImageScaleTransform.ScaleY = zoomLevel;
                
                // Force layout update
                ImageScrollViewer.UpdateLayout();
                
                // Calculate how much the point has moved due to zoom
                double zoomRatio = newZoom / oldZoom;
                
                // Adjust scroll to keep the same point under the mouse
                double newOffsetX = ImageScrollViewer.HorizontalOffset * zoomRatio + pointX * (zoomRatio - 1);
                double newOffsetY = ImageScrollViewer.VerticalOffset * zoomRatio + pointY * (zoomRatio - 1);
                
                ImageScrollViewer.ScrollToHorizontalOffset(newOffsetX);
                ImageScrollViewer.ScrollToVerticalOffset(newOffsetY);
                
                System.Diagnostics.Debug.WriteLine($"Zoom level: {zoomLevel}");
                UpdateZoomIndicator();
            }
        }
    }

    private async void UpdateZoomIndicator()
    {
        ZoomText.Text = $"{(int)(zoomLevel * 100)}%";
        ZoomIndicator.Visibility = Visibility.Visible;
        
        await Task.Delay(1000);
        ZoomIndicator.Visibility = Visibility.Collapsed;
    }

    private void ImageScrollViewer_MouseDown(object sender, MouseButtonEventArgs e)
    {
        // Middle mouse button always pans, left button only pans when zoomed
        if (e.MiddleButton == MouseButtonState.Pressed || 
            (e.LeftButton == MouseButtonState.Pressed && zoomLevel > 1.0))
        {
            isPanning = true;
            lastMousePosition = e.GetPosition(ImageScrollViewer);
            ImageScrollViewer.Cursor = Cursors.SizeAll; // Grabbing hand cursor
            ImageScrollViewer.CaptureMouse();
            e.Handled = true;
        }
    }

    private void ImageScrollViewer_MouseMove(object sender, MouseEventArgs e)
    {
        // Show hand cursor hint when hovering and middle button would work
        if (!isPanning && originalImage != null)
        {
            if (e.MiddleButton == MouseButtonState.Pressed)
            {
                // Start panning if middle button is pressed during move
                isPanning = true;
                lastMousePosition = e.GetPosition(ImageScrollViewer);
                ImageScrollViewer.Cursor = Cursors.SizeAll;
                ImageScrollViewer.CaptureMouse();
                e.Handled = true;
            }
        }

        if (isPanning && lastMousePosition.HasValue)
        {
            Point currentPosition = e.GetPosition(ImageScrollViewer);
            double deltaX = currentPosition.X - lastMousePosition.Value.X;
            double deltaY = currentPosition.Y - lastMousePosition.Value.Y;

            // Smooth scrolling with live updates
            double newHorizontalOffset = ImageScrollViewer.HorizontalOffset - deltaX;
            double newVerticalOffset = ImageScrollViewer.VerticalOffset - deltaY;

            ImageScrollViewer.ScrollToHorizontalOffset(newHorizontalOffset);
            ImageScrollViewer.ScrollToVerticalOffset(newVerticalOffset);

            lastMousePosition = currentPosition;
            e.Handled = true;
        }
    }

    private void ImageScrollViewer_MouseUp(object sender, MouseButtonEventArgs e)
    {
        if (isPanning)
        {
            isPanning = false;
            lastMousePosition = null;
            ImageScrollViewer.Cursor = Cursors.Arrow;
            ImageScrollViewer.ReleaseMouseCapture();
        }
    }

    private void ResetZoom()
    {
        zoomLevel = 1.0;
        ImageScaleTransform.ScaleX = 1.0;
        ImageScaleTransform.ScaleY = 1.0;
        ImageScrollViewer.ScrollToHorizontalOffset(0);
        ImageScrollViewer.ScrollToVerticalOffset(0);
        ZoomIndicator.Visibility = Visibility.Collapsed;
    }
}

