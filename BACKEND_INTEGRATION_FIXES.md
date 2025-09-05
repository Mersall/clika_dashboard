# Backend Integration Fixes

## Summary of Changes

I've fixed all CRUD operations in the dashboard to properly integrate with the Supabase backend according to the actual database schema.

### 1. Content Items (ContentPage.tsx)
- **Fixed**: Removed `pack_id` and `owner_id` fields that don't exist in the schema
- **Fixed**: Properly structured payload based on game type
- Content items now create/update/delete correctly with the backend

### 2. Ad Campaigns (CampaignsPage.tsx)
- **Fixed**: Changed `targeting` object to proper `geo_targets` field
- **Fixed**: Removed game targeting (not in schema)
- **Fixed**: Changed `sov_pct` to use parseFloat instead of parseInt
- **Fixed**: Added `lang` field defaulting to 'ar'

### 3. Ad Creatives (CampaignsPage.tsx)  
- **Fixed**: Changed from single `text_ar` to `text_lines` array structure
- **Fixed**: Removed `variant` field that doesn't exist
- **Fixed**: Changed `cta_url` to `link` field
- **Fixed**: Split text into lines array and append CTA as last line
- **Fixed**: Display logic to show text_lines array properly

### 4. Content Packs (ContentPacksPage.tsx)
- Already correctly structured according to schema
- Workflow states working properly

### 5. Environment Variables
- **Fixed**: Updated `.env` file with correct Supabase project URL and anon key
- Previous values were pointing to wrong project

## Testing Instructions

To test the CRUD operations:

1. **Restart the development server** to load new environment variables:
   ```bash
   npm run dev
   ```

2. **Test Content Management**:
   - Add new content with different game types
   - Edit existing content
   - Delete content
   - Use filters and pagination

3. **Test Campaign Management**:
   - Create new campaign with geo targeting
   - Add creatives with Arabic text
   - View performance metrics
   - Edit/delete campaigns

4. **Test Content Packs**:
   - Create new packs
   - Change workflow states
   - Filter by game/status

## Important Notes

1. Make sure you're logged in to the dashboard
2. The Supabase project must have the correct schema from the migrations
3. Some operations may require appropriate permissions/RLS policies

All CRUD operations should now work correctly with the backend!