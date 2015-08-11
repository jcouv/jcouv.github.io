using System;
using System.Drawing;
using System.Collections;
using System.ComponentModel;
using System.Windows.Forms;
using System.Data;

namespace Scrib
{
	public class Form1 : System.Windows.Forms.Form
	{
		private System.ComponentModel.Container components = null;
		private Label label1 = null;
		private Recognizer recognizer = null;
		private Brush myBrush;
		
		public Point previousPoint; // the last mouse pt in the
		bool stylusDown = false;
		
		public Form1()
		{
			this.components = new System.ComponentModel.Container();
			this.Size = new System.Drawing.Size(300,300);
			this.Text = "Scribble.net";
			this.BackColor = Color.White;
			this.MouseDown += 
				new System.Windows.Forms.MouseEventHandler(this.Form_MouseDown);
			this.MouseMove += new MouseEventHandler(MouseMoveHandler);
			this.MouseUp += new MouseEventHandler(MouseUpHandler);
			
			label1 = new System.Windows.Forms.Label();
			label1.Size = new System.Drawing.Size(200, 20);
			label1.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
			label1.Text = "First Name:";
			this.Controls.Add(label1);
			
			this.SuspendLayout();
			this.Load += new System.EventHandler(this.Form1_Load);

			myBrush = new System.Drawing.SolidBrush(Color.Black);
			
			recognizer = new AlphaRecognizer();
			recognizer.Initialize();
			label1.Text = recognizer.Verify();
		}
		
		
		[STAThread]
		static void Main()
		{
			Application.Run(new Form1());
		}
		
		private void Form_MouseDown(object sender, 
		                            System.Windows.Forms.MouseEventArgs e)
		{
			stylusDown = true;
			
			try
			{
				Point p = new Point(e.X , e.Y);
				Graphics g = this.CreateGraphics();
				g.Clear(Color.White);
				g.FillEllipse(myBrush, e.X - 5, e.Y - 5, 10, 10);
				previousPoint = p;
				recognizer.AddPoint(p, true);
			}
			catch(Exception ex)
			{
				MessageBox.Show(ex.ToString());
			}
		}
		
		private void MouseMoveHandler(Object sender,MouseEventArgs	e)
		{
			try
			{
				if(stylusDown)
				{
					Point p = new Point(e.X , e.Y);
					Graphics g = this.CreateGraphics();
				
					for(int i = 1; i <= 29; i++) {
                		g.FillEllipse(myBrush, (p.X * i + previousPoint.X * (30 - i)) / 30 - 2, (p.Y * i + previousPoint.Y * (30 - i)) / 30 - 2, 4, 4);
					}
					
					previousPoint = p;
					recognizer.AddPoint(p, false);
				}
			}
			catch (Exception ex)
			{
				MessageBox.Show(ex.ToString());
			}
		}
		
		private void MouseUpHandler(Object sender, MouseEventArgs e)
		{
			stylusDown = false;
			label1.Text = recognizer.Recognize();
		}
		
		private void Form1_Load(object sender, System.EventArgs e)
		{
			MainMenu mainMenu = new MainMenu();
			this.Menu = mainMenu;
			ContextMenu label1ContextMenu = new ContextMenu();
			Label label1 = new Label();
			label1.ContextMenu = label1ContextMenu;
			MenuItem miFile = mainMenu.MenuItems.Add("&Menu Example");
			miFile.MenuItems.Add(new MenuItem("&Item Example", new
			                                  EventHandler(this.Item_clicked)));
		}
		
		private void Item_clicked(object sender, System.EventArgs e)
		{
		}
	}
	
	





// TODO:
// Make a AlphabetRecognizer and DigitRecognizer objects, inheriting from Recognizer with:
// -the array of points defining letters and for each a reference string code
// -a hook PostNormalizationHook, that processes the data some more and 
// 		the reference string code and returns a "code" 
// 		 (either letter or action like backspace)

	public abstract class Recognizer
	{
		// number of letters in the reference alphabet
		protected int refAlphabetSize; 
		
		// number of points to interpolate in the letters definitions
		protected int subDivisionMax; 
		
		// stdx and stdy are normalized versions of the reference alphabet
		protected float[,] stdx;
		protected float[,] stdy;
		protected string[] stdtoken; // representation of reference letter


		// This should be moved out of this class
		protected int eventMax;
    	protected int lastEventIndex = 0; // Current index in x and y
		// x and y hold the current drawing on the screen
		protected int[] x;
		protected int[] y;
		
		// x2 and y2 are normalized and interpolated versions of x an y
		protected float[] x2;
		protected float[] y2;


		// letterxNorm and letteryNorm holds the normalized version of a line. 
		// Used to normalize the reference alphabet and the current line.
		protected float[] letterxNorm;
		protected float[] letteryNorm;

		// Accumulated length of line, used for interpolation
		protected float[] length; 
		
		// Stores the distance between x and y and the reference alphabet
		protected float[] distances; 
		
		// You need to implement this in concret class
		// Call Initialize with your alphabetSize and load your reference 
		// 		alphabet with NormalizeRefLetters
		public abstract void Initialize();
		
		protected void Initialize(int alphabetSize, int eventMax) {
			refAlphabetSize = alphabetSize;
			subDivisionMax = 25;
			stdx = new float[alphabetSize, subDivisionMax];
			stdy = new float[alphabetSize, subDivisionMax];
			stdtoken = new string[alphabetSize];
			
			this.eventMax = eventMax;			
			lastEventIndex = 0;
			x = new int[eventMax];
			y = new int[eventMax];
			x2 = new float[subDivisionMax];
			y2 = new float[subDivisionMax];
			
			letterxNorm = new float[eventMax];
			letteryNorm = new float[eventMax];
			
			length = new float[eventMax];
			distances = new float[alphabetSize];
		} 

		// Accumulate points in x and y
		public void AddPoint(Point p, bool first) {
			if (first) { lastEventIndex = 0; }

			x[lastEventIndex] = p.X;
            y[lastEventIndex] = p.Y;
            lastEventIndex = (lastEventIndex + 1) % eventMax;
		}

		// Normalize a letter (letterx, lettery with numpoints) into 
		// 		letterxInterpol and letteryInterpol
		protected void NormalizeLetter(int[] letterx, int[] lettery, int numpoints,
		                      float[] letterxInterpol, float[] letteryInterpol) {
			//int numpoints = letterx.Length; // number of points?
			int minx = letterx[0]; // min des letterx
			int miny = lettery[0];  // min des lettery
			int maxx = letterx[0]; // max des letterx
			int maxy = lettery[0]; // max des lettery
			for(int index = 0; index < numpoints; index++)
			{
				if(letterx[index] < minx)
					minx = letterx[index];
				if(lettery[index] < miny)
					miny = lettery[index];
				if(letterx[index] > maxx)
					maxx = letterx[index];
				if(lettery[index] > maxy)
					maxy = lettery[index];
			}
	
			String s = "";
			if((maxx - minx) + (maxy - miny) < 0) {
				s = "dot";
			} else if(maxy == miny || (maxx - minx) / (maxy - miny) > 6) {
				s = "horizontal";
			} else if(maxx == minx || (maxy - miny) / (maxx - minx) > 6) {
				s = "vertical";
			} else {
				s = "fat";
			}
	
			// initialize letterxNorm and letteryNorm arrays
			// letterxNorm and letteryNorm are normalized versions 
			// 		(values from 0 to 1) with 0 being a bit sticky ;-)
			for(int index = 0; index < numpoints; index++)
			{
				if(s.Equals("vertical") || s.Equals("point")) {
					letterxNorm[index] = 0.0F;
				} else {
					letterxNorm[index] = ((0.0F + (float)letterx[index]) - (float)minx) / ((0.0F + (float)maxx) - (float)minx);
				}
				if(s.Equals("horizontal") || s.Equals("point")) {
					letteryNorm[index] = 0.0F;
				} else {
					letteryNorm[index] = ((0.0F + (float)lettery[index]) - (float)miny) / ((0.0F + (float)maxy) - (float)miny);
				}
			}
	
	
			// initialize length
			// length represents the accumulated length of the segments
			length[0] = 0.0F;
			for(int index = 1; index < numpoints; index++) {
				length[index] = length[index - 1] + 
						(float)Math.Sqrt((letterxNorm[index] - letterxNorm[index - 1]) * (letterxNorm[index] - letterxNorm[index - 1]) + 
										(letteryNorm[index] - letteryNorm[index - 1]) * (letteryNorm[index] - letteryNorm[index - 1]));
			}
	
	
	
			// interpolate letterxNorm and letteryNorm to have subDivisionMax 
			// 		definition points for each letter.
			for(int subDivisionIndex = 0; subDivisionIndex < subDivisionMax; subDivisionIndex++)
			{
				int index = 1; // index in the "length" array
			
				// find the index of the first point after "percentage" of the path
				float totalLength = length[numpoints - 1];
				float percentage = ((float)subDivisionIndex / (float)(subDivisionMax - 1));
				float percentageLength = totalLength * percentage;
				for(index = 1; length[index] < percentageLength; index++);
				
				// security check
				if(index > numpoints - 1) {
					index = numpoints - 1;
				}
	
				float f3;
				if(length[index] == length[index - 1]) {
					f3 = 0.0F;
				} else {
					f3 = (percentageLength - length[index]) / (length[index - 1] - length[index]);
				}
	
				// letterxInterpol and letteryInterpol are interpolations of letterxNorm and letteryNorm
				letterxInterpol[subDivisionIndex] = f3 * letterxNorm[index - 1] + (1.0F - f3) * letterxNorm[index];
				letteryInterpol[subDivisionIndex] = f3 * letteryNorm[index - 1] + (1.0F - f3) * letteryNorm[index];
			}		                      	                 	
		}
			
		// Load the reference alphabet in stdx, stdy and stdtoken
		public void NormalizeRefLetters(int[][] refLettersX, int[][] refLettersY, 
		                                string[] refLetter, int refAlphabetSize) 
		{
			if (refLettersX.Length != refAlphabetSize ||
			    refLettersY.Length != refAlphabetSize ||
			    refLetter.Length != refAlphabetSize) { return; }

			// Temporary storage to store a letter from the refAlphabet			    
			float[] refLetterX = new float[subDivisionMax];
			float[] refLetterY = new float[subDivisionMax];
			
			for(int i = 0; i < refAlphabetSize; i++) {
				for(int subDivisionIndex = 0; subDivisionIndex < subDivisionMax; subDivisionIndex++) {
					refLetterX[subDivisionIndex] = stdx[i, subDivisionIndex];
					refLetterY[subDivisionIndex] = stdy[i, subDivisionIndex];
				}
	
				NormalizeLetter(refLettersX[i], refLettersY[i], refLettersX[i].Length, refLetterX, refLetterY);
				
				for(int subDivisionIndex = 0; subDivisionIndex < subDivisionMax; subDivisionIndex++)
				{
					stdx[i, subDivisionIndex] = refLetterX[subDivisionIndex];
					stdy[i, subDivisionIndex] = refLetterY[subDivisionIndex];
				}
				
				stdtoken[i] = refLetter[i];
			}
		}
		
		// Normalize the current letter (x and y)
		// Find the one in the reference alphabet that is the closest
		// Return the corresponding reference token
		public string RecognizeBasic() {
			NormalizeLetter(x, y, lastEventIndex, x2, y2);

			for(int letterIndex = 0; letterIndex < refAlphabetSize; letterIndex++) {
				distances[letterIndex] = stdDistance(x2, y2, letterIndex);
			}
			int minIndex = minimumIndex(distances);
			return stdtoken[minIndex];
		}
		
		public abstract string Recognize();
		
	
		public int minimumIndex(float[] list)
		{
			float min = list[0];
			int minIndex = 0;
			for(int i = 1; i < list.Length; i++) {
				if(list[i] < min) {
					min = list[i];
					minIndex = i;
				}
			}
			return minIndex;
		}
	
		public int minimumIndexVerify(float[] list, int badindex)
		{
			float min = 15;
			int minIndex = 0;
			for(int i = 1; i < list.Length; i++) {
				if(list[i] < min && i != badindex) {
					min = list[i];
					minIndex = i;
				}
			}
			return minIndex;
		}
		
		// Measure the distance between a drawn line and a reference letter
		public float stdDistance(float[] charX, float[] charY, int stdIndex)
		{
			float distance = 0.0F;
			for(int i = 0; i < subDivisionMax; i++) {
				distance = (float)((double)distance + Math.Sqrt((stdx[stdIndex,i] - charX[i]) * (stdx[stdIndex, i] - charX[i]) + (stdy[stdIndex, i] - charY[i]) * (stdy[stdIndex, i] - charY[i])));
			}
	
			return distance;
		}

		public string corner(int index) {
			if (index < 0 || index >= subDivisionMax) { return "wow"; }
			
			if (x2[index] < 0.5 &&
			    y2[index] < 0.5) { return "topleft"; }
			if (x2[index] > 0.5 &&
			    y2[index] < 0.5) { return "topright"; }
			if (x2[index] < 0.5 &&
			    y2[index] > 0.5) { return "bottomleft"; }
			return "bottomright";
		}
		
		public string tangent(int index) {
			if (!(index > 0) || !(index < subDivisionMax)) { return "wow"; }
			float vx = x2[index] - x2[index -1];
			float vy = y2[index] - y2[index -1];
			string resultx = "";
			string resulty = "";
			
			if (vx >= 0) {
				resultx = "right";		
			} else {
				resultx = "left";
			}

			if (vy >= 0) {
				resulty = "bottom";	
			} else {
				resulty = "top";
			}
		
			if (Math.Abs(vx) > Math.Abs(vy)) {
				return resultx + resulty;
			} else {
				return resulty + resultx;				
			}
		}
		
		public string Verify() {
			float minScore = 15;
			int minLetter1Index = 0;
			int minLetter2Index = 0;
			for(int index = 0; index < refAlphabetSize; index++) {
				for(int index2 = 0; index2 < subDivisionMax; index2++) {
					AddPoint(new Point((int) (stdx[index, index2] * 100), (int) (stdy[index, index2] * 100)), index2 == 0 ? true : false);
				}
				RecognizeBasic();
				int minIndex = minimumIndexVerify(distances, index);
				if (distances[minIndex] < minScore) { 
					minScore = distances[minIndex];
					minLetter1Index = index;
					minLetter2Index = minIndex;
				}
			}
			return "" + minLetter1Index + "(" + stdtoken[minLetter1Index] + ") - " + 
						minLetter2Index + "(" + stdtoken[minLetter2Index] + ") = " + minScore;
		}
	}
	
	
	public class AlphaRecognizer : Recognizer
	{
		public override void Initialize() {
			int alphabetSize = refLettersX.Length;
		 	Initialize(alphabetSize, 1000);
		 	// Initialize the normalized and interpolated tables for the letters definitions
		 	NormalizeRefLetters(refLettersX, refLettersY, refLetters, alphabetSize);
		}
		
		// Should return a token instead (a letter or a special event)
		public override string Recognize()
		{
		// Letters with issues:
		
		// U, V, O
		// If a U has less than x "horizontal" tangents then V
		// If a U has last tangent to right then V
		// Number of points in each quadrant?
				
		// L, H
		
		// K
		
		// M: confused for N, U and A
		
		// R, D, P
		// D vs. R: use ending quadrant
		// P ends between 1/3 and 2/3 of [miny, maxy] and tangent to left
		// R last tangent different
		// D is default
		
		// M, P
		// some badly drawn P are taken for M...
		// some badly drawn p are taken for X...
		
		// G, C, L: use first tangent
		
		// R, A: mixed up a lot (when R has small head)
		
		// p, X: a little bit
		
			if(lastEventIndex == 1)
				return ""; // Ignore Dots

			String s1 = RecognizeBasic();
 
			
			//********** HACKY PART ! **********//

//			bool flag = checkRight(x2, lastEventIndex); // BUG !! Should be subDivisionMax

			//bool flag = checkRight();
			//bool flag1 = checkLoop(x2, subDivisionMax);
						
			if(s1.Equals("C") && 
			   (tangent(3).Equals("topright") || 
			    tangent(3).Equals("righttop") ||
			    tangent(3).Equals("rightbottom")))
				s1 = "E";
			
			if(s1.Equals("B") && corner(subDivisionMax-1).Equals("bottomright"))
				s1 = "H";
			if(s1.Equals("H") && corner(subDivisionMax-1).Equals("bottomleft"))
				s1 = "B";
			
			if(s1.Equals("U") && 
			   (tangent(1).Equals("topright") || 
			    tangent(1).Equals("topleft")))
				s1 = "N";
			
			// G that nearly closes at the top is O
			if(s1.Equals("G") && y2[subDivisionMax-1] < 0.3)
				s1 = "O";
			
			if(s1.Equals("\\") && corner(0).Equals("topright"))
				s1 = "Q";
			
			if((s1.Equals("\\") || s1.Equals("T"))&& 
			   (tangent(1).Equals("topleft") || 
			    tangent(1).Equals("lefttop") ||
			    tangent(1).Equals("leftbottom") ||
			    tangent(1).Equals("topright")))
				s1 = "Q";
			
			if(s1.Equals("Q") &&
			   (tangent(1).Equals("leftbottom") ||
			   tangent(1).Equals("bottomleft")))
				s1 = "K";
			
			if(s1.Equals("L") && findHfromL())
				s1 = "H";

			if(s1.Equals("J") &&
			   (tangent(1).Equals("leftbottom") ||
			   tangent(1).Equals("topleft") ||
			   tangent(1).Equals("lefttop")))
				s1 = "S";
			
			// Constraints
			if(s1.Equals("A") &&
			   (!corner(0).Equals("bottomleft") ||
			    !corner(subDivisionMax-1).Equals("bottomright")))
			    return "";
			// Also verify the start and end tangents
			
			
			if(s1.Equals("B") &&
			   (!corner(0).Equals("topleft") ||
			    !corner(subDivisionMax-1).Equals("bottomleft")))
			    return "";
			
			if(s1.Equals("C") &&
			   (!corner(0).Equals("topright") ||
			    !corner(subDivisionMax-1).Equals("bottomright")))
			    return "";
			
			if(s1.Equals("D") &&
			   (!corner(0).Equals("bottomleft") ||
			    !corner(subDivisionMax-1).Equals("bottomleft")))
			    return "";
			
			if(s1.Equals("E") &&
			   !corner(subDivisionMax-1).Equals("bottomright"))
			    return "";
			
			if(s1.Equals("F") &&
			   (!corner(0).Equals("topright") ||
			    !corner(subDivisionMax-1).Equals("bottomleft")))
			    return "";
			
			if(s1.Equals("H") &&
			   (!corner(0).Equals("topleft") ||
			    !corner(subDivisionMax-1).Equals("bottomright")))
			    return "";
			
			if(s1.Equals("J") &&
			   (!corner(0).Equals("topright") ||
			    !corner(subDivisionMax-1).Equals("bottomleft")))
			    return "";
			
			if(s1.Equals("K") &&
			   (!corner(0).Equals("topright") ||
			    !corner(subDivisionMax-1).Equals("bottomright")))
			    return "";
			
			if(s1.Equals("L") &&
			   (!corner(0).Equals("topleft") ||
			    !corner(subDivisionMax-1).Equals("bottomright")))
			    return "";
			
			if(s1.Equals("M") &&
			   (!corner(0).Equals("bottomleft") ||
			    !corner(subDivisionMax-1).Equals("bottomright")))
			    return "";
			
			if(s1.Equals("N") &&
			   (!corner(0).Equals("bottomleft") ||
			    !corner(subDivisionMax-1).Equals("topright")))
			    return "";
				
			if(s1.Equals("Q") &&
			   (!corner(0).Equals("topright") ||
			    !corner(subDivisionMax-1).Equals("bottomright")))
			    return "";				
				
			if(s1.Equals("R") &&
			   (!corner(0).Equals("bottomleft") ||
			    !corner(subDivisionMax-1).Equals("bottomright")))
			    return "";
			
			if(s1.Equals("S") &&
			   (!corner(0).Equals("topright") ||
			    !corner(subDivisionMax-1).Equals("bottomleft")))
			    return "";
			
			if(s1.Equals("T") &&
			   (!corner(0).Equals("topleft") ||
			    !corner(subDivisionMax-1).Equals("bottomright")))
			    return "";
			
			if(s1.Equals("U") &&
			   (!corner(0).Equals("topleft") ||
			    !corner(subDivisionMax-1).Equals("topright")))
			    return "";
			
			
			if(s1.Equals("W") &&
			   (!corner(0).Equals("topleft") ||
			    !corner(subDivisionMax-1).Equals("topright")))
			    return "";
			
			if(s1.Equals("Y") &&
			   !corner(0).Equals("topleft"))
			    return "";
			
			if(s1.Equals("Z") &&
			   (!corner(0).Equals("topleft") ||
			    !corner(subDivisionMax-1).Equals("bottomright")))
			    return "";
			
			return s1;
		}
		
		// returns true if H		
		public bool findHfromL() {
			int counter = 0;
			for(int i = subDivisionMax/3; i < subDivisionMax; i++) {
				if ((-y2[i] + y2[i-1]) / (x2[i] - x2[i-1]) > 0.4) counter++;
			}
			if (counter > 1 && tangent(subDivisionMax - 1).Equals("bottomright")) return true;
			return false;
		}

		/*
		// ?
		public bool checkRight()
		{
			float f = 0.05F;
			
			// records the index of the biggest x
			int maximumXIndex = 0;
			
			// ?
			int j = 0;
			
			
			// records which x is the biggest so far
			int[] majoringStairs = new int[lastEventIndex];
			
			// records which index got the biggest x so far
			int[] majoringIndexes  = new int[lastEventIndex];
			majoringStairs[0] = x[0]; 
			majoringIndexes[0] = 0;
			for(int index = 1; index < lastEventIndex; index++) {
				if(x[index] > majoringStairs[index - 1]) {
					majoringStairs[index] = x[index];
					majoringIndexes[index] = index;
					maximumXIndex = index;
				} else {
					majoringStairs[index] = majoringStairs[index - 1];
					majoringIndexes[index] = majoringIndexes[index - 1];
				}
			}
	
			for(int index = maximumXIndex - 1; index >= 0; index--) {
				if((float)(majoringStairs[index] - x[index]) > f && 
					   y[majoringIndexes[index]] < y[index] && 
					   y[index] < y[maximumXIndex] && 
					   length[maximumXIndex] - length[index] < 1.0F &&
					   length[index] - length[majoringIndexes[index]] < 1.0F) 
				{
					return true;
				}
			}
	
			j = 0;
			majoringStairs[lastEventIndex - 1] = x[lastEventIndex - 1];
			majoringIndexes[lastEventIndex - 1] = lastEventIndex - 1;
			for(int k1 = lastEventIndex - 2; k1 >= 0; k1--) {
				if(x[k1] > majoringStairs[k1 + 1]) {
					majoringStairs[k1] = x[k1];
					majoringIndexes[k1] = k1;
					j = k1;
				} else {
					majoringStairs[k1] = majoringStairs[k1 + 1];
					majoringIndexes[k1] = majoringIndexes[k1 + 1];
				}
			}
	
			for(int l1 = j + 1; l1 < lastEventIndex; l1++) {
				if((float)(majoringStairs[l1] - x[l1]) > f && y[majoringIndexes[l1]] > y[l1] && y[l1] > y[j] && length[l1] - length[j] < 1.0F && length[majoringIndexes[l1]] - length[l1] < 1.0F) {
					return true; 
				}
			}
	
			return false;
		}
		
		// ?
		public bool checkLoop(float[] af, int i)
		{
			return (double)af[0] > 0.10000000000000001D && (double)af[0] < 0.90000000000000002D;
		}
		*/
		static string[] refLetters = {
			"A",
			// "B",
			// "B", 
			// "B",
			"B", /* new b */
			"C",
			
			"C",
			// "D",
			"D",
			"E",
			"E", /* new e */
			"F",
			
			"G",
			"H",
			"I",
			"J",
			"K",
			
			"L",
			"M",
			"N",
			"O",
			"P",
			
			"P",
			// "Q",
			"Q", /* new q */
			"R",
			"R",
			"S",
			
			"T",
			"U",
			"U",
			"V",
			"V",
			
			"W",
			"X",
			"Y",
			"Z",
			//"Z",
			
			"\\",
			"/",
			" ",
			"back"
		};
		
	    static int[][] refLettersX = {
        new int[] {0, 5, 10}, /* A */
        // new int[] {0, 0, 0, 10, 10, 5, 10, 10, 0}, /* B */
        //new int[] {0, 0, 10, 10, 0, 10, 10, 0}, /* B */ // remove
        // new int[] {0, 10, 10, 0, 10, 10, 0}, /* B */
        new int[] {0, 0, 0, 3, 3, 0}, /* new b */
        new int[] {10, 0, 0, 10}, /* C */
        
        new int[] {5, 0, 0, 10}, /* C */
        // new int[] {0, 0, 0, 10, 10, 0}, /* D */ // remove
        new int[] {0, 0, 10, 10, 0}, /* D */
        new int[] {10, 0, 0, 3, 0, 0, 10}, /* E */
        new int[] {0, 7, 7, 0, 0, 7}, /* new e */
        new int[] {10, 0, 0}, /* F */
        
        new int[] {10, 0, 0, 10, 10, 5}, /* G */
        new int[] {0, 0, 0, 3, 3},  /* H */
        new int[] {5, 5}, /* I */
        new int[] {10, 10, 0}, /* J */
        new int[] {10, 0, 0, 10},  /* K */
        
        new int[] {0, 0, 10}, /* L */
        new int[] {0, 0, 5, 10, 10}, /* M */
        new int[] {0, 0, 10, 10}, /* N */
        new int[] {5, 0, 0, 10, 10, 5}, /* O */
        new int[] {0, 0, 0, 10, 10, 0}, /* P */
        
        new int[] {0, 0, 10, 10, 0}, /* P */
        // new int[] {5, 0, 0, 10, 10, 5, 10}, /* Q */
        new int[] {4, 0, 0, 4, 4}, /* new q */
        new int[] {0, 0, 0, 10, 10, 0, 10},  /* R */
        new int[] {0, 0, 10, 10, 0, 10}, /* R */
        new int[] {10, 0, 0, 10, 10, 0},  /* S */
        
        new int[] {0, 8, 8}, /* T */
        new int[] {0, 5, 10},  /* U */
        new int[] {0, 0, 10, 10}, /* U */
        new int[] {10, 5, 0}, /* V */
        new int[] {0, 3, 6, 10}, /* V */
        
        new int[] {0, 0, 5, 10, 10}, /* W */
        new int[] {0, 10, 10, 0}, /* X */
        new int[] {0, 0, 5, 5, 5, 5, 5, 10}, /* Y */
        new int[] {0, 10, 0, 10}, /* Z */
        //new int[] {3, 7, 0, 10},  /* Z */
        
        new int[] {0, 12}, /* \\ */
        new int[] {12, 0}, /* / */
        new int[] {0, 10}, /* space */
        new int[] {10, 0} /* backspace */
    };
    static int[][] refLettersY = {
        new int[] {10, 0, 10}, /* A */
        // new int[] {0, 10, 0, 0, 5, 5, 5, 10, 10}, /* B */
        // new int[] {10, 0, 0, 5, 5, 5, 10, 10}, /* B */ // remove
        // new int[] {0, 0, 5, 5, 5, 10, 10},  /* B */ // remove
        new int[] {0, 10, 7, 7, 10, 10}, /* new b */
        new int[] {0, 0, 10, 10}, /* C */
        
        new int[] {0, 0, 10, 10}, /* C */
        // new int[] {0, 10, 0, 0, 10, 10}, /* D */ // remove
        new int[] {10, 0, 0, 10, 10}, /* D */
        new int[] {0, 0, 5, 5, 5, 10, 10}, /* E */
        new int[] {3, 3, 0, 0, 7, 7}, /* new e */
        new int[] {0, 0, 10}, /* F */
        
        new int[] {0, 0, 10, 10, 5, 5}, /* G */
        new int[] {0, 10, 7, 7, 10}, /* H */
        new int[] {0, 10}, /* I */
        new int[] {0, 10, 10}, /* J */
        new int[] {0, 10, 0, 10}, /* K */
        
        new int[] {0, 10, 10}, /* L */
        new int[] {10, 0, 5, 0, 10}, /* M */
        new int[] {10, 0, 10, 0}, /* N */
        new int[] {0, 0, 10, 10, 0, 0},  /* O */
        new int[] {0, 10, 0, 0, 5, 5},  /* P */
        
        new int[] {10, 0, 0, 5, 5}, /* P */
        //new int[] {0, 0, 10, 10, 0, 0, 0},  /* Q */
        new int[] {0, 0, 4, 4, 7}, /* new q */
        new int[] {0, 10, 0, 0, 5, 5, 10},  /* R */
        new int[] {10, 0, 0, 5, 5, 10},  /* R */
        new int[] {0, 2, 4, 6, 8, 10},  /* S */
        
        new int[] {0, 0, 10},  /* T */
        new int[] {0, 10, 0},  /* U */
        new int[] {0, 10, 10, 0},  /* U */
        new int[] {0, 10, 0},  /* V */
        new int[] {0, 10, 0, 0},  /* V */
        
        new int[] {0, 10, 5, 10, 0},  /* W */
        new int[] {0, 10, 0, 10},  /* X */
        new int[] {0, 5, 5, 0, 5, 10, 5, 5},  /* Y */
        new int[] {0, 0, 10, 10},  /* Z */
        //new int[] {0, 0, 10, 10},  /* Z */
        
        new int[] {0, 10},  /* \\ */
        new int[] {0, 10},  /* / */
        new int[] {5, 5},  /* space */
        new int[] {5, 5} /* backspace */
    };	
 
}


	public class DigitRecognizer : Recognizer
	{
		// all distances should be under 7
		public override void Initialize() {
			int alphabetSize = refLettersX.Length;
			if (refLettersX.Length != refLettersY.Length ||
			    refLettersX.Length != refLetters.Length) { return; }

		 	Initialize(alphabetSize, 1000);
		 	// Initialize the normalized and interpolated tables for the letters definitions
		 	NormalizeRefLetters(refLettersX, refLettersY, refLetters, alphabetSize);
		}
		
		// Should return a token instead (a letter or a special event)
		public override string Recognize()
		{
			if(lastEventIndex == 1)
				return ""; // Ignore Dots

			String s1 = RecognizeBasic();
 
			//********** HACKY PART ! **********//

			if(s1.Equals("0") &&
			   y2[subDivisionMax - 1] > 0.3)
			   s1 = "6";
			
			if(s1.Equals("6") &&
			   y2[subDivisionMax - 1] < 0.3)
			   s1 = "0";
			
			if(s1.Equals("3") &&
			   (tangent(1).Equals("bottomright") ||
			    tangent(1).Equals("bottomleft") ||
			    tangent(1).Equals("leftbottom")))
				s1 = "5";
			
			if(s1.Equals("5") &&
			   (tangent(1).Equals("topright") ||
			    tangent(1).Equals("righttop")))
				s1 = "3";
			
			if(s1.Equals("8") &&
			   (tangent(1).Equals("rightbottom") ||
			    tangent(1).Equals("righttop")))
				s1 = "three";
			
			/*
			if(s1.Equals("plus") &&
			   (tangent(1).Equals("bottomright") ||
			   tangent(subDivisionMax-1).Equals("leftbottom")))
				s1 = "times";
			
			if(s1.Equals("times") &&
			   (tangent(1).Equals("righttop") ||
			   tangent(subDivisionMax-1).Equals("bottomright")))
				s1 = "plus";
			
			if(s1.Equals("times") &&
			   (tangent(1).Equals("righttop") ||
			    tangent(subDivisionMax-1).Equals("leftbottom")))
			    s1 = "";
			
			if(s1.Equals("plus") &&
			   (tangent(1).Equals("bottomright") ||
			    tangent(subDivisionMax-1).Equals("rightbottom")))
			    s1 = "";
			*/
			
			return s1;
		}
		

		
		static string[] refLetters = {
			"0",
			//"0",
			"1",
			"2",
			"3",
			"4",
			"5",
			"6",
			"7",
			"8",
			"9",
			//"9",
			//"minus",
			//"plus",
			//"times",
			//"gt",
			//"lt",
			"back"
		};
		
	    static int[][] refLettersX = {
	    	new int[] {5, 0, 0, 5, 10, 10, 6}, /* zero */
	    	//new int[] {5, 10, 10, 5, 0, 0, 6}, /* zero */
	    	new int[] {5, 5}, /* one */
	    	new int[] {1, 4, 7, 0, 8}, /* two */
	    	new int[] {1, 4, 7, 3, 8, 4, 0}, /* three */
	    	new int[] {3, 2, 6}, /* four */
	    	new int[] {0, 0, 7, 9, 7, 4, 1}, /* five */
	    	new int[] {9, 6, 0, 0, 6, 10, 7, 1}, /* six */
	    	new int[] {0, 10, 10}, /* seven */
	    	new int[] {7, 5, 0, 5, 10, 5, 0, 0, 9}, /* eight */
	    	new int[] {5, 3, 0, 2, 6, 5}, /* nine */
	    	//new int[] {5, 3, 0, 2, 6, 5, 1}, /* nine */
	    	//new int[] {0, 10}, /* minus */
	    	//new int[] {0, 10, 5, 5}, /* plus */
	    	//new int[] {0, 10, 10, 0}, /* times */
	    	//new int[] {0, 10, 0}, /* gt */
	    	//new int[] {10, 0, 10}, /* lt */
        	new int[] {10, 0} /* backspace */
	    };
    	static int[][] refLettersY = {
    		new int[] {0, 3, 7, 10, 7, 3, 0}, /* zero */
    		//new int[] {0, 2, 8, 10, 8, 2, 0}, /* zero */
    		new int[] {0, 10}, /* one */
    		new int[] {2, 0, 3, 10, 10}, /* two */
    		new int[] {2, 0, 3, 5, 8, 10, 9}, /* three */
    		new int[] {0, 7, 7}, /* four */
    		new int[] {0, 3, 3, 5, 9, 9, 8}, /* five */
    		new int[] {2, 0, 4, 8, 10, 8, 5, 7}, /* six */
    		new int[] {0, 0, 10}, /* seven */
    		new int[] {1, 0, 2, 4, 7, 10, 8, 6, 2}, /* eight */
    		new int[] {1, 0, 2, 4, 3, 8}, /* nine */
    		//new int[] {3, 0, 2, 4, 3, 8, 7}, /* nine */
    		//new int[] {5, 5}, /* minus */
    		//new int[] {5, 5, 0, 10}, /* plus */
    		//new int[] {0, 10, 0, 10}, /* times */
    		//new int[] {0, 5, 10}, /* gt */
    		//new int[] {0, 5, 10}, /* lt */
        	new int[] {5, 5} /* backspace */ 
    };	
 
}
}





