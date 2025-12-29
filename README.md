# Ahmed Helmy Legal Services API

A comprehensive Node.js/Express API backend for managing legal services, legislation, knowledge bank, news, library resources, and branch information.

## Features

- **Legislation Management**: Create, read, update, and delete legislation items
- **Knowledge Bank**: Store and manage legal guides, FAQs, case studies, and tutorials
- **News Management**: Publish and manage legal news and announcements
- **Library System**: Manage books, journals, case law, contracts, and research papers
- **Branch Management**: Handle multiple office locations with contact information and operating hours
- **Full-Text Search**: Search across all modules using MongoDB text indexes
- **Pagination**: Efficient data retrieval with configurable pagination
- **RESTful API**: Standard REST conventions for all endpoints

## Project Structure

```
.
├── server.js                 # Main server file
├── config/
│   ├── database.js          # MongoDB connection configuration
│   └── constants.js         # Application constants
├── models/
│   ├── Legislation.js       # Legislation schema
│   ├── KnowledgeBank.js     # Knowledge Bank schema
│   ├── News.js              # News schema
│   ├── Library.js           # Library schema
│   └── Branch.js            # Branch schema
├── routes/
│   ├── legislation.js       # Legislation routes
│   ├── knowledgeBank.js     # Knowledge Bank routes
│   ├── news.js              # News routes
│   ├── library.js           # Library routes
│   └── branches.js          # Branch routes
├── .env.example             # Environment variables template
├── package.json             # Project dependencies
└── README.md                # This file
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/ahmedhelmy200-rgb/ahmed-helmy-legal.git
   cd ahmed-helmy-legal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ahmed-helmy-legal
   ```

4. **Start the server**
   ```bash
   # Development (with auto-reload)
   npm run dev
   
   # Production
   npm start
   ```

5. **Verify the server**
   - Health check: `http://localhost:5000/api/health`

## API Endpoints

### Legislation
- `GET /api/legislation` - Get all legislations (with pagination)
- `GET /api/legislation/:id` - Get single legislation
- `POST /api/legislation` - Create legislation
- `PUT /api/legislation/:id` - Update legislation
- `DELETE /api/legislation/:id` - Delete legislation

### Knowledge Bank
- `GET /api/knowledge-bank` - Get all articles (with pagination)
- `GET /api/knowledge-bank/:id` - Get single article
- `GET /api/knowledge-bank/top/rated` - Get top rated articles
- `POST /api/knowledge-bank` - Create article
- `PUT /api/knowledge-bank/:id` - Update article
- `DELETE /api/knowledge-bank/:id` - Delete article

### News
- `GET /api/news` - Get all news (with pagination)
- `GET /api/news/:id` - Get single news
- `GET /api/news/featured/pinned` - Get pinned news
- `POST /api/news` - Create news
- `PUT /api/news/:id` - Update news
- `DELETE /api/news/:id` - Delete news

### Library
- `GET /api/library` - Get all library items (with pagination)
- `GET /api/library/:id` - Get single item
- `GET /api/library/top/downloads` - Get top downloaded items
- `POST /api/library` - Create library item
- `PUT /api/library/:id` - Update library item
- `DELETE /api/library/:id` - Delete library item
- `POST /api/library/:id/download` - Record download

### Branches
- `GET /api/branches` - Get all branches (with pagination)
- `GET /api/branches/:id` - Get single branch
- `GET /api/branches/code/:code` - Get branch by code
- `GET /api/branches/city/:city` - Get branches by city
- `POST /api/branches` - Create branch
- `PUT /api/branches/:id` - Update branch
- `DELETE /api/branches/:id` - Delete branch

## Query Parameters

### Pagination
- `page` (default: 1) - Page number
- `limit` (default: 10, max: 100) - Items per page

### Filtering
- `search` - Full-text search across relevant fields
- `status` - Filter by status
- `category` - Filter by category
- `type` - Filter by type
- `author` - Filter by author
- `city` - Filter branches by city

### Example Requests

```bash
# Get legislations with search
curl "http://localhost:5000/api/legislation?search=tax&page=1&limit=10"

# Get knowledge bank articles by category
curl "http://localhost:5000/api/knowledge-bank?category=legal-guides&difficulty=beginner"

# Get published news sorted by date
curl "http://localhost:5000/api/news?status=published&page=1"

# Get all branches in a city
curl "http://localhost:5000/api/branches/city/Cairo"
```

## Database Schemas

### Legislation
```javascript
{
  title: String,
  description: String,
  content: String,
  type: String (law|decree|regulation|amendment),
  status: String (active|inactive|pending|archived),
  effectiveDate: Date,
  expiryDate: Date,
  category: String,
  tags: [String],
  attachments: [Object],
  author: String,
  source: String,
  views: Number,
  isPublished: Boolean
}
```

### KnowledgeBank
```javascript
{
  title: String,
  description: String,
  content: String,
  category: String (legal-guides|faq|case-studies|best-practices|tutorials),
  author: String,
  status: String (draft|published|archived),
  difficulty: String (beginner|intermediate|advanced),
  tags: [String],
  attachments: [Object],
  views: Number,
  rating: Number,
  isPublished: Boolean
}
```

### News
```javascript
{
  title: String,
  summary: String,
  content: String,
  author: String,
  category: String (legal-updates|court-decisions|announcements|events|opinion),
  status: String (draft|published|archived),
  publishedDate: Date,
  featuredImage: Object,
  tags: [String],
  views: Number,
  isPinned: Boolean,
  isPublished: Boolean
}
```

### Library
```javascript
{
  title: String,
  description: String,
  type: String (book|journal|case-law|contract-template|form|document|research-paper),
  author: String,
  category: String,
  fileUrl: String,
  coverImage: Object,
  tags: [String],
  views: Number,
  downloads: Number,
  rating: Number,
  isPublished: Boolean
}
```

### Branch
```javascript
{
  name: String,
  code: String (unique),
  type: String (headquarters|regional-office|branch-office|satellite-office),
  location: {
    address: Object,
    coordinates: Object
  },
  contact: Object,
  manager: Object,
  staffCount: Number,
  operatingHours: Object,
  facilities: [String],
  status: String (active|inactive|under-maintenance),
  isPublished: Boolean
}
```

## Error Handling

The API returns consistent error responses:

```json
{
  "status": "error",
  "message": "Description of the error",
  "code": "ERROR_CODE"
}
```

## Development

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
npm run lint:fix
```

## Best Practices Implemented

- ✅ RESTful API conventions
- ✅ Proper HTTP status codes
- ✅ Comprehensive error handling
- ✅ Input validation
- ✅ Database indexing for performance
- ✅ CORS enabled
- ✅ Request logging with Morgan
- ✅ Environment-based configuration
- ✅ Pagination support
- ✅ Full-text search capability

## Future Enhancements

- [ ] Authentication & Authorization (JWT)
- [ ] Role-based access control (RBAC)
- [ ] File upload handling
- [ ] Email notifications
- [ ] Advanced caching with Redis
- [ ] API documentation with Swagger
- [ ] Rate limiting
- [ ] Request validation middleware
- [ ] Comprehensive unit tests
- [ ] Docker containerization

## Contributing

Contributions are welcome! Please follow these steps:

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

MIT License - feel free to use this project for any purpose.

## Contact

For questions or support, please contact Ahmed Helmy at [contact information].

## Version History

### v1.0.0 (2025-12-29)
- Initial release
- Core API setup with 5 main modules
- MongoDB integration
- RESTful endpoints
- Full-text search
- Pagination support
