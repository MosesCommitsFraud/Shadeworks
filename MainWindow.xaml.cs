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

    private void CloseButton_Click(object sender, RoutedEventArgs e)
    {
        Close();
    }

    private void MinimizeButton_Click(object sender, RoutedEventArgs e)
    {
        WindowState = WindowState.Minimized;
    }

    private void MaximizeButton_Click(object sender, RoutedEventArgs e)
    {
        WindowState = WindowState == WindowState.Maximized ? WindowState.Normal : WindowState.Maximized;
    }

    // Drag and Drop Event Handlers
    private void Window_Drop(object sender, DragEventArgs e)
    {
        HandleDrop(e);
    }

    private void Window_DragEnter(object sender, DragEventArgs e)
    {
        if (e.Data.GetDataPresent(DataFormats.FileDrop))
        {
            e.Effects = DragDropEffects.Copy;
        }
    }

    private void Window_DragLeave(object sender, DragEventArgs e)
    {
        // Nothing specific needed
    }

    private void Canvas_Drop(object sender, DragEventArgs e)
    {
        HandleDrop(e);
    }

    private void Canvas_DragEnter(object sender, DragEventArgs e)
    {
        if (e.Data.GetDataPresent(DataFormats.FileDrop))
        {
            e.Effects = DragDropEffects.Copy;
        }
    }

    private void Canvas_DragLeave(object sender, DragEventArgs e)
    {
        // Nothing specific needed
    }

    private void HandleDrop(DragEventArgs e)
    {
        if (e.Data.GetDataPresent(DataFormats.FileDrop))
        {
            string[] files = (string[])e.Data.GetData(DataFormats.FileDrop);
            if (files != null && files.Length > 0)
            {
                LoadImage(files[0]);
            }
        }
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
            LoadImage(openFileDialog.FileName);
        }
    }

    private void LoadImage(string fileName)
    {
        try
        {
            originalImage = new BitmapImage(new Uri(fileName));
            processor = new ImageProcessor(originalImage);
            DropPlaceholder.Visibility = Visibility.Collapsed;
            ImageScrollViewer.Visibility = Visibility.Visible;
            ResetZoomInternal();
            ProcessImage();
            StatusText.Text = $"Loaded: {Path.GetFileName(fileName)}";
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Error loading image: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            StatusText.Text = "Error loading image";
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
                StatusText.Text = $"Exported: {Path.GetFileName(saveFileDialog.FileName)}";
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error exporting image: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                StatusText.Text = "Error exporting image";
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

    // Zoom Controls
    private void ZoomIn_Click(object sender, RoutedEventArgs e)
    {
        if (originalImage != null)
        {
            zoomLevel = Math.Min(MaxZoom, zoomLevel + ZoomIncrement);
            ApplyZoom();
        }
    }

    private void ZoomOut_Click(object sender, RoutedEventArgs e)
    {
        if (originalImage != null)
        {
            zoomLevel = Math.Max(MinZoom, zoomLevel - ZoomIncrement);
            ApplyZoom();
        }
    }

    private void ResetZoom_Click(object sender, RoutedEventArgs e)
    {
        if (originalImage != null)
        {
            ResetZoomInternal();
        }
    }

    private void ApplyZoom()
    {
        ImageScaleTransform.ScaleX = zoomLevel;
        ImageScaleTransform.ScaleY = zoomLevel;
        StatusText.Text = $"Zoom: {(int)(zoomLevel * 100)}%";
    }

    private void Style_Changed(object sender, SelectionChangedEventArgs e)
    {
        ProcessImage();
    }

    private void Presets_Changed(object sender, SelectionChangedEventArgs e)
    {
        ProcessImage();
    }

    private void PaletteCategory_Changed(object sender, SelectionChangedEventArgs e)
    {
        ProcessImage();
    }

    private void Palette_Changed(object sender, SelectionChangedEventArgs e)
    {
        ProcessImage();
    }

    private void SavePreset_Click(object sender, RoutedEventArgs e)
    {
        MessageBox.Show("Preset saving functionality coming soon!", "Save Preset", MessageBoxButton.OK, MessageBoxImage.Information);
        StatusText.Text = "Preset save requested";
    }

    private void ResetAll_Click(object sender, RoutedEventArgs e)
    {
        // Reset all controls to defaults
        ScaleSlider.Value = 11;
        LineScaleSlider.Value = 1;
        SmoothingSlider.Value = 0;
        BleedSlider.Value = 0;
        ContrastSlider.Value = 45;
        MidtonesSlider.Value = 50;
        HighlightsSlider.Value = 50;
        LuminanceSlider.Value = 50;
        BlurSlider.Value = 0;
        DepthSlider.Value = 6;
        StyleComboBox.SelectedIndex = 0;
        PresetsComboBox.SelectedIndex = 0;
        PaletteCategoryComboBox.SelectedIndex = 0;
        PaletteComboBox.SelectedIndex = 0;
        InvertCheckBox.IsChecked = false;
        StatusText.Text = "Reset all settings";
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
        StatusText.Text = "Processing...";
        System.Diagnostics.Debug.WriteLine("Starting image processing...");

        try
        {
            var ditherType = ((ComboBoxItem)StyleComboBox.SelectedItem)?.Content?.ToString() ?? "None";
            
            var settings = new ImageProcessingSettings
            {
                DitherAlgorithm = ditherType,
                ColorCount = (int)ScaleSlider.Value,
                Brightness = 0,
                Contrast = 0,
                Saturation = 0,
                Grayscale = false,
                Invert = false
            };

            System.Diagnostics.Debug.WriteLine($"Settings: Scale={settings.ColorCount}, Style={ditherType}");

            var processed = await Task.Run(() => processor.Process(settings));
            
            System.Diagnostics.Debug.WriteLine("Processing complete, updating UI");
            
            Dispatcher.Invoke(() =>
            {
                ImagePreview.Source = processed;
                System.Diagnostics.Debug.WriteLine("Image source updated");
            });

            StatusText.Text = "Ready";
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error: {ex.Message}\n{ex.StackTrace}");
            Dispatcher.Invoke(() =>
            {
                MessageBox.Show($"Error processing image: {ex.Message}\n\nStack trace:\n{ex.StackTrace}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                StatusText.Text = "Error processing image";
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
                StatusText.Text = $"Zoom: {(int)(zoomLevel * 100)}%";
            }
        }
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

    private void ResetZoomInternal()
    {
        zoomLevel = 1.0;
        ImageScaleTransform.ScaleX = 1.0;
        ImageScaleTransform.ScaleY = 1.0;
        ImageScrollViewer.ScrollToHorizontalOffset(0);
        ImageScrollViewer.ScrollToVerticalOffset(0);
        StatusText.Text = "Ready";
    }

    // Help Menu Event Handlers
    private void Documentation_Click(object sender, RoutedEventArgs e)
    {
        try
        {
            System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
            {
                FileName = "https://github.com/yourusername/shadeworks/wiki",
                UseShellExecute = true
            });
            StatusText.Text = "Opening documentation...";
        }
        catch
        {
            MessageBox.Show("Documentation will be available soon!\n\nFor now, visit: https://github.com/yourusername/shadeworks", 
                "Documentation", MessageBoxButton.OK, MessageBoxImage.Information);
        }
    }

    private void KeyboardShortcuts_Click(object sender, RoutedEventArgs e)
    {
        var shortcuts = "Keyboard Shortcuts:\n\n" +
                       "File Operations:\n" +
                       "  Ctrl+O - Open Image\n" +
                       "  Ctrl+S - Export Image\n" +
                       "  Ctrl+Q - Exit\n\n" +
                       "View Controls:\n" +
                       "  Alt+Scroll - Zoom In/Out\n" +
                       "  Middle Mouse - Pan Image\n" +
                       "  Ctrl+0 - Reset Zoom\n" +
                       "  Ctrl++ - Zoom In\n" +
                       "  Ctrl+- - Zoom Out\n\n" +
                       "Editing:\n" +
                       "  Ctrl+R - Reset All Settings\n" +
                       "  Ctrl+Z - Undo (coming soon)\n" +
                       "  Ctrl+Y - Redo (coming soon)";

        MessageBox.Show(shortcuts, "Keyboard Shortcuts", MessageBoxButton.OK, MessageBoxImage.Information);
        StatusText.Text = "Displayed keyboard shortcuts";
    }

    private void ReportIssue_Click(object sender, RoutedEventArgs e)
    {
        try
        {
            System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
            {
                FileName = "https://github.com/yourusername/shadeworks/issues/new",
                UseShellExecute = true
            });
            StatusText.Text = "Opening issue tracker...";
        }
        catch
        {
            MessageBox.Show("To report an issue, please visit:\nhttps://github.com/yourusername/shadeworks/issues", 
                "Report Issue", MessageBoxButton.OK, MessageBoxImage.Information);
        }
    }

    private void CheckUpdates_Click(object sender, RoutedEventArgs e)
    {
        MessageBox.Show("You are running ShadeWorks v1.0\n\nThis is the latest version.", 
            "Check for Updates", MessageBoxButton.OK, MessageBoxImage.Information);
        StatusText.Text = "Checked for updates";
    }

    private void About_Click(object sender, RoutedEventArgs e)
    {
        var aboutMessage = "ShadeWorks v1.0\n\n" +
                          "A modern image dithering and processing tool\n\n" +
                          "Features:\n" +
                          "• Multiple dithering algorithms (Uniform Modulation, Floyd-Steinberg, Atkinson, Ordered Bayer)\n" +
                          "• Real-time image processing\n" +
                          "• Color palette customization\n" +
                          "• Advanced adjustment controls\n" +
                          "• Drag & drop support\n\n" +
                          "© 2024 ShadeWorks. All rights reserved.\n\n" +
                          "Built with .NET 9.0 and WPF";

        MessageBox.Show(aboutMessage, "About ShadeWorks", MessageBoxButton.OK, MessageBoxImage.Information);
        StatusText.Text = "About ShadeWorks";
    }
}