import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

class MLService {
  private model: use.UniversalSentenceEncoder | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Load the Universal Sentence Encoder model
      this.model = await use.load();
      this.isInitialized = true;
      console.log('ML Service initialized');
    } catch (error) {
      console.error('Failed to initialize ML Service:', error);
      throw error;
    }
  }

  async analyzeText(text: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
    keywords: string[];
    embedding: number[];
  }> {
    if (!this.isInitialized || !this.model) {
      throw new Error('ML Service not initialized');
    }

    try {
      // Generate embeddings
      const embeddings = await this.model.embed([text]);
      const embeddingArray = await embeddings.array();
      
      // Simple sentiment analysis (in a real app, you'd use a proper sentiment model)
      const sentimentScore = Math.random(); // Replace with actual model prediction
      const sentiment = sentimentScore > 0.7 ? 'positive' : sentimentScore < 0.4 ? 'negative' : 'neutral';
      
      // Simple keyword extraction (in a real app, you'd use a proper NLP model)
      const words = text.toLowerCase().split(/\s+/);
      const keywords = [...new Set(words.filter(word => word.length > 3))].slice(0, 5);
      
      return {
        sentiment,
        confidence: Math.random(),
        keywords,
        embedding: embeddingArray[0]
      };
    } catch (error) {
      console.error('Error analyzing text:', error);
      throw error;
    }
  }

  async compareTexts(text1: string, text2: string): Promise<number> {
    if (!this.isInitialized || !this.model) {
      throw new Error('ML Service not initialized');
    }

    try {
      const embeddings = await this.model.embed([text1, text2]);
      const [embedding1, embedding2] = tf.split(embeddings, 2, 0);
      
      // Calculate cosine similarity
      const normalized1 = tf.div(embedding1, tf.norm(embedding1, 'euclidean'));
      const normalized2 = tf.div(embedding2, tf.norm(embedding2, 'euclidean'));
      const similarity = tf.matMul(normalized1, normalized2, false, true);
      
      const similarityScore = (await similarity.data())[0];
      return similarityScore;
    } catch (error) {
      console.error('Error comparing texts:', error);
      throw error;
    }
  }
}

export const mlService = new MLService();

// Initialize the service when imported
mlService.initialize().catch(console.error);
