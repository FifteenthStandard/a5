export default class SubscriberSet<TEvent> {
  private subscribers: Set<(event: TEvent) => void> = new Set();

  subscribe(callback: (event: TEvent) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  };

  notify(event: TEvent): void {
    for (const callback of this.subscribers) {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    }
  }
};
