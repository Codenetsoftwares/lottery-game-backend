import TicketRange from "../models/ticketRange.model.js";
import CustomError from "../utils/extendError.js";

export class TicketService {
  constructor(group, series, number, sem) {
    this.group = group;
    this.series = series;
    this.number = number;
    this.sem = sem;
  }

  list() {
    const allSeries = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "G",
      "H",
      "J",
      "K",
      "L",
      "M",
      "N",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
    ];

    let currentSeriesIndex = allSeries.indexOf(this.series);
    if (currentSeriesIndex === -1) {
      throw new Error("Invalid series chosen");
    }

    let currentGroup = this.group;
    const tickets = [];
    const incrementThreshold = this.sem === 5 || this.sem === 25 ? 5 : 10;

    for (let i = 0; i < this.sem; i++) {
      tickets.push(
        `${String(currentGroup).padStart(2, "0")} ${
          allSeries[currentSeriesIndex]
        } ${String(this.number).padStart(5, "0")}`
      );

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

  async calculatePrice(marketId) {
    try {
      const ticketRange = await TicketRange.findOne({
        where: {
          marketId,
        },
      });
      if (!ticketRange) {
        throw new CustomError("TicketRange not found for the given marketId");
      }
      const prices = ticketRange.price * this.sem;
      return prices;
    } catch (error) {
      return new CustomError("error", error);
    }
  }
}
