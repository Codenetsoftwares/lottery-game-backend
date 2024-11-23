import TicketRange from "../models/ticketRange.model.js";
import CustomError from "../utils/extendError.js";

export class TicketService {
  constructor(group, series, number, sem) {
    this.group = group;
    this.series = series;
    this.number = number;
    this.sem = sem;
  }

  async list(group, series, number, sem, marketId) {
    const ticketRangeData = await TicketRange.findOne({ where: { marketId } });

    if (!ticketRangeData) {
      throw new Error("Ticket range not found for the given market.");
    }

    const {
      group_start,
      group_end,
      series_start,
      series_end,
      number_start,
      number_end,
    } = ticketRangeData;

    const allSeries = Array.from(
      { length: series_end.charCodeAt(0) - series_start.charCodeAt(0) + 1 },
      (_, i) => String.fromCharCode(series_start.charCodeAt(0) + i)
    ).filter((letter) => !["F", "I", "O"].includes(letter)); 

    let currentSeriesIndex = allSeries.indexOf(series);
    if (currentSeriesIndex === -1) {
      throw new Error("Invalid series chosen");
    }

    let currentGroup = group;
    const tickets = [];
    const incrementThreshold = sem === 5 || sem === 25 ? 5 : 10;

    for (let i = 0; i < sem; i++) {
      if (currentGroup >= group_start && currentGroup <= group_end) {
        if (
          parseInt(number) >= parseInt(number_start) &&
          parseInt(number) <= parseInt(number_end)
        ) {
          tickets.push(
            `${String(currentGroup).padStart(2, "0")} ${
              allSeries[currentSeriesIndex]
            } ${String(number).padStart(5, "0")}`
          );
        }

        currentSeriesIndex++;
        if (currentSeriesIndex >= allSeries.length) {
          currentSeriesIndex = 0;
        }

        if ((i + 1) % incrementThreshold === 0) {
          currentGroup++;
          if (currentGroup > group_end) {
            currentGroup = group_start;
          }
          currentSeriesIndex = allSeries.indexOf(series);
        }
      }
    }

    return tickets;
  }

  async calculatePrice(marketId, sem) {
    try {
      const ticketRange = await TicketRange.findOne({
        where: {
          marketId,
        },
      });
      if (!ticketRange) {
        throw new CustomError("TicketRange not found for the given marketId");
      }
      const prices = ticketRange.price * sem;
      return prices;
    } catch (error) {
      return new CustomError("error", error);
    }
  }
}
