# Vector Search Setup Guide

## Step 1: Create Vector Search Index in MongoDB Atlas

You need to create a vector search index in your MongoDB Atlas dashboard. Here's how:

### 1.1 Access Atlas Search
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Select your cluster
3. Click on "Search" tab
4. Click "Create Search Index"

### 1.2 Create the Index
1. Choose "JSON Editor"
2. Select your database and the `transactions` collection
3. Paste this configuration:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "descriptionEmbedding",
      "numDimensions": 384,
      "similarity": "cosine"
    }
  ]
}
```

4. Name the index: `transaction_vector_search`
5. Click "Create Search Index"

### 1.3 Wait for Index to Build
- The index will take a few minutes to build
- You'll see a green "Active" status when ready

## Step 2: Generate Embeddings for Existing Data

Run this command to generate embeddings for all existing transactions:

```bash
npx tsx scripts/generate-embeddings.ts
```

This will:
- Connect to your database
- Find transactions without embeddings
- Generate embeddings using the local model
- Update the transactions with embeddings

**Note**: This may take 5-10 minutes for 1000+ transactions.

## Step 3: Test the Search

Once the index is active and embeddings are generated, test the search in the AI Chat:

1. Go to `/admin/accounting`
2. Click "AI Assistant" tab
3. Try queries like:
   - "Find transactions about concrete"
   - "Show me materials for Project X"
   - "What did we spend on labor last month?"

## Automatic Embedding Generation

New transactions will automatically get embeddings when created. The system will:
1. Generate embedding on transaction create/update
2. Store it in the `descriptionEmbedding` field
3. Make it searchable immediately

## Troubleshooting

### Index Not Working?
- Check if index status is "Active" in Atlas
- Verify index name is exactly `transaction_vector_search`
- Ensure `numDimensions` is 384

### No Results?
- Run the embedding generator script
- Check if transactions have `descriptionEmbedding` field
- Try a simpler query first

### Slow Performance?
- Vector search on M0 is limited to 100 candidates
- Consider upgrading to M10 for better performance
- Use text search fallback (already implemented)

## Next Steps

After setup is complete:
1. Test various search queries
2. Monitor performance
3. Adjust search weights if needed (in `hybridSearch.ts`)
4. Consider adding more searchable fields
