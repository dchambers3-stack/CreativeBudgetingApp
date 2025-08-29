import { Injectable } from '@angular/core';
import { Filter } from 'bad-words';

@Injectable({
  providedIn: 'root'
})
export class ProfanityFilterService {
  private filter: Filter;

  constructor() {
    this.filter = new Filter();
    
    // Customize the filter
    this.setupCustomFilter();
  }

  private setupCustomFilter(): void {
    // Add custom words to the filter
    this.filter.addWords('customBadWord', 'anotherbadword');
    
    // Remove words from filter if needed
    // this.filter.removeWords('damn', 'hell');
    
    // Set custom placeholder character
    this.filter.placeHolder = '*';
  }

  /**
   * Check if text contains profanity
   * @param text - Text to check
   * @returns boolean - true if profanity found
   */
  isProfane(text: string): boolean {
    if (!text) return false;
    return this.filter.isProfane(text);
  }

  /**
   * Clean profanity from text by replacing with asterisks
   * @param text - Text to filter
   * @returns Cleaned text with profanity masked
   */
  clean(text: string): string {
    if (!text) return text;
    return this.filter.clean(text);
  }

  /**
   * Validate and clean message for sending
   * @param message - Message to validate
   * @param options - Validation options
   * @returns Validation result with cleaned message
   */
  validateAndClean(message: string, options: {
    allowMildProfanity?: boolean;
    blockSevereProfanity?: boolean;
    showWarnings?: boolean;
  } = {}): {
    isValid: boolean;
    originalMessage: string;
    cleanedMessage: string;
    hasProfanity: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];
    const hasProfanity = this.isProfane(message);
    const cleanedMessage = this.clean(message);
    
    let isValid = true;

    if (hasProfanity) {
      if (options.blockSevereProfanity) {
        // You can implement severity checking here
        isValid = false;
        warnings.push('Message contains inappropriate language and cannot be sent.');
      } else {
        if (options.showWarnings) {
          warnings.push('Inappropriate language has been filtered from your message.');
        }
      }
    }

    return {
      isValid,
      originalMessage: message,
      cleanedMessage,
      hasProfanity,
      warnings
    };
  }

  /**
   * Process data coming from backend to filter profanity
   * @param data - Data object to process
   * @param fieldsToFilter - Array of field names to filter
   * @returns Processed data with filtered fields
   */
  processBackendData<T>(data: T, fieldsToFilter: string[]): T {
    if (!data || typeof data !== 'object') return data;
    
    const processedData = { ...data } as any;
    
    fieldsToFilter.forEach(field => {
      if (processedData[field] && typeof processedData[field] === 'string') {
        processedData[field] = this.clean(processedData[field]);
      }
    });
    
    return processedData;
  }

  /**
   * Process array of data from backend
   * @param dataArray - Array of data objects
   * @param fieldsToFilter - Fields to filter in each object
   * @returns Processed array with filtered content
   */
  processBackendDataArray<T>(dataArray: T[], fieldsToFilter: string[]): T[] {
    if (!Array.isArray(dataArray)) return dataArray;
    
    return dataArray.map(item => this.processBackendData(item, fieldsToFilter));
  }

  /**
   * Get list of detected profane words in text
   * @param text - Text to analyze
   * @returns Array of detected profane words
   */
  getProfaneWords(text: string): string[] {
    if (!text) return [];
    
    const words = text.toLowerCase().split(/\s+/);
    const profaneWords: string[] = [];
    
    words.forEach(word => {
      // Remove punctuation for checking
      const cleanWord = word.replace(/[^\w]/g, '');
      if (this.filter.isProfane(cleanWord)) {
        profaneWords.push(word);
      }
    });
    
    return profaneWords;
  }
}
