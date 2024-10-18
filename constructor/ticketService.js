export class TicketService {
  constructor(group, series, number, sem) {
    this.group = group; 
    this.series = series; 
    this.number = number; 
    this.sem = sem; 
  }

  list() {
    const seriesArray = ['A', 'B', 'C', 'D', 'E', 'G', 'H', 'J', 'K', 'L'];
    let currentGroup = this.group;
    let currentSeriesIndex = 0;
    const tickets = [];

    for (let i = 0; i < this.sem; i++) {
      const seriesArrays = (this.sem === 5 || this.sem === 25) ? ['A', 'B', 'C', 'D', 'E'] : seriesArray;

      tickets.push(`${currentGroup} ${seriesArray[currentSeriesIndex]} ${this.number}`);

      currentSeriesIndex++;

      // If the series reaches past the defined array, reset to 'A' and increment the group
      if (currentSeriesIndex >= seriesArrays.length) {
        currentSeriesIndex = 0; 
        currentGroup++;
      }
    }

    return tickets; 
  }

  calculatePrice() {
    const price = 6 * this.sem;
    return price;
  }
}
