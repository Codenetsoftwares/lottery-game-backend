export class TicketService {
  constructor(group, series, number, sem) {
    this.group = group;
    this.series = series;
    this.number = number;
    this.sem = sem;
  }

  list() {
    const allSeries = ['A', 'B', 'C', 'D', 'E', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    let currentSeriesIndex = allSeries.indexOf(this.series);
    if (currentSeriesIndex === -1) {
      throw new Error("Invalid series chosen");
    }

    let currentGroup = this.group;
    const tickets = [];
    const incrementThreshold = (this.sem === 5 || this.sem === 25) ? 5 : 10; 

    for (let i = 0; i < this.sem; i++) {
      tickets.push(`${String(currentGroup).padStart(2, '0')} ${allSeries[currentSeriesIndex]} ${String(this.number).padStart(5, '0')}`);

      currentSeriesIndex++;
      if (currentSeriesIndex >= allSeries.length) {
        currentSeriesIndex = 0;
      }

      if ((i + 1) % incrementThreshold === 0) {
        currentGroup++;
        if (currentGroup > 99) {
          currentGroup = 1;
        }
        currentSeriesIndex = allSeries.indexOf(this.series);
      }
    }

    return tickets;
   
  }

  calculatePrice() {
    const price = 6 * this.sem;
    return price;
  }
}
