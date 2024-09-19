import { string } from "../constructor/string.js";
import { generateTicket} from "../controllers/ticketController.js";
import { authorize } from "../middlewares/auth.js";


export const ticketRoutes = (app) => {
  app.get('/api/generate-tickets/:sem',authorize([string.Admin]), generateTicket);




//Not use 
  
  const dummyData = Array.from({ length: 42 }, (_, index) => ({
    id: index + 1,
    name: `Item ${index + 1}`,
    description: `This is a description for item ${index + 1}`
}));

// GET API endpoint

app.get('/api/dummy-data', (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = parseInt(req.query.limit) || 10; // Default to limit of 10 items

  // Calculate the starting index and ending index for slicing
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  // Slice the dummy data for the requested page
  const paginatedData = dummyData.slice(startIndex, endIndex);

  // Create a response object
  const response = {
      page,
      limit,
      totalItems: dummyData.length,
      totalPages: Math.ceil(dummyData.length / limit),
      data: paginatedData,
  };

  res.json(response);
});

};
