import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { mlService } from "@/services/mlService";

interface AnalysisResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  keywords: string[];
}

export function TextAnalysis() {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [compareText, setCompareText] = useState('');
  const [similarity, setSimilarity] = useState<number | null>(null);

  const analyzeText = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      const analysis = await mlService.analyzeText(text);
      setResult({
        sentiment: analysis.sentiment,
        confidence: analysis.confidence,
        keywords: analysis.keywords
      });
    } catch (err) {
      console.error('Error analyzing text:', err);
      setError('Failed to analyze text. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const compareTexts = async () => {
    if (!text.trim() || !compareText.trim()) {
      setError('Please enter both texts to compare');
      return;
    }

    setIsComparing(true);
    setError(null);
    
    try {
      const similarityScore = await mlService.compareTexts(text, compareText);
      setSimilarity(similarityScore);
    } catch (err) {
      console.error('Error comparing texts:', err);
      setError('Failed to compare texts. Please try again.');
    } finally {
      setIsComparing(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <CheckCircle className="w-4 h-4" />;
      case 'negative':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Text Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Enter text to analyze..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button 
              onClick={analyzeText} 
              disabled={isAnalyzing || !text.trim()}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : 'Analyze'}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Sentiment:</span>
              <Badge className={getSentimentColor(result.sentiment)}>
                <div className="flex items-center space-x-1">
                  {getSentimentIcon(result.sentiment)}
                  <span>{result.sentiment}</span>
                </div>
              </Badge>
              <span className="text-sm text-muted-foreground">
                ({(result.confidence * 100).toFixed(1)}% confidence)
              </span>
            </div>

            <div>
              <div className="font-medium mb-2">Keywords:</div>
              <div className="flex flex-wrap gap-2">
                {result.keywords.map((keyword, index) => (
                  <Badge key={index} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t mt-4">
          <h3 className="font-medium mb-2">Compare with another text:</h3>
          <Textarea
            placeholder="Enter text to compare..."
            value={compareText}
            onChange={(e) => setCompareText(e.target.value)}
            className="min-h-[80px] mb-2"
          />
          <div className="flex justify-between items-center">
            <Button 
              onClick={compareTexts} 
              disabled={isComparing || !text.trim() || !compareText.trim()}
              variant="outline"
            >
              {isComparing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Comparing...
                </>
              ) : 'Compare'}
            </Button>
            
            {similarity !== null && (
              <div className="text-sm">
                Similarity: <span className="font-medium">{(similarity * 100).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
