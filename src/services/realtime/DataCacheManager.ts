
export class DataCacheManager {
  private cache: Map<string, string> = new Map();

  hasDataChanged(dataType: string, newData: any): boolean {
    const dataString = JSON.stringify(newData);
    const lastData = this.cache.get(dataType);
    
    if (!lastData || lastData !== dataString) {
      this.cache.set(dataType, dataString);
      return true;
    }
    
    return false;
  }

  updateCache(dataType: string, data: any): void {
    this.cache.set(dataType, JSON.stringify(data));
  }

  clearCache(): void {
    this.cache.clear();
  }
}
