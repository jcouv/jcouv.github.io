import java.awt.*;
import java.awt.geom.*;
import java.awt.image.*;

public class ClearType extends java.applet.Applet
{
  Font f = new Font("Times New Roman", Font.BOLD, 35);

  public void update(Graphics g)
  {paint(g);}

  public void paint(Graphics g)
  {
    g.setFont(f);
    g.setColor(Color.white);
    g.fillRect(0, 0, size().width, size().height);
    g.setColor(Color.black);
    g.drawString("Sample Text String", 5, getFontMetrics(f).getHeight());
    drawClearType(g, "Sample Text String", 5, getFontMetrics(f).getHeight()*3);
  }

  public int fuzz(int a, int b)
  {
    int red =   ((b >> 16) & 0xff)/3 + ((a >> 16) & 0xff);
    int green = ((b >> 8) & 0xff)/3 + ((a >> 8) & 0xff);
    int blue =  (b & 0xff)/3 + (a & 0xff);
    return (0xff << 24)|(red << 16)|(green << 8)|blue;
  }

  public void drawClearType(Graphics g, String s, int x, int y)
  {
    FontMetrics fm = getFontMetrics(f);
    int width = fm.stringWidth(s)*3;
    int height = fm.getHeight();
    Image img = createImage(width, height);
    Graphics grph = img.getGraphics();
    grph.setColor(Color.white);
    grph.fillRect(0, 0, width, height);
    grph.setColor(Color.black);
    grph.setFont(f.deriveFont(AffineTransform.getScaleInstance(3, 1)));
    grph.drawString(s, 0, height-fm.getMaxDescent());
    int[] pixelsA = getPixelArray(img);
    int[] pixels = new int[pixelsA.length];
    int[] newpixels = new int[(width/3)*height];
    for (int i = 0; i < width*height; i++)
    {
      newpixels[i/3] = (0xff << 24);
      if (i != width*height-1)
        pixels[i+1] = fuzz(pixels[i+1], pixelsA[i]);
      pixels[i] = fuzz(pixels[i], pixelsA[i]);
      if (i != 0)
        pixels[i-1] = fuzz(pixels[i-1], pixelsA[i]);
    }
    for (int i = 0; i < width*height; i++)
      switch(i%3)
      {
        case 0:
          newpixels[i/3] |= (pixels[i]) & 0xff0000;
          break;
        case 1:
          newpixels[i/3] |= (pixels[i]) & 0xff00;
          break;
        case 2:
          newpixels[i/3] |= (pixels[i]) & 0xff;
          break;
      }
    g.drawImage(imageFromPixels(newpixels, width/3, height), x, y-height, width/3, height, this);
  }

  private int[] getPixelArray(Image img)
  {
    int width = img.getWidth(this);
    int height = img.getHeight(this);
    int[] pixels = new int[width * height];
    PixelGrabber pg = new PixelGrabber(img, 0, 0, width, height, pixels, 0, width);
    try {pg.grabPixels();}
    catch(Exception e){}
    return pixels;
  }

  private Image imageFromPixels(int[] pixels, int width, int height)
  {
    return getToolkit().createImage(new MemoryImageSource(width, height, pixels, 0, width));
  }
}

