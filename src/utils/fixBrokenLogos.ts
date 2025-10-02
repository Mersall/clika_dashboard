import { supabase } from '../services/supabase';
import { workingLogoUrls, getWorkingLogoUrl } from './workingLogoUrls';

export async function fixBrokenFootballLogos() {
  try {
    console.log('Fetching football logos to fix...');

    // Fetch ALL football logos to check their URLs
    const { data: allLogos, error: fetchError } = await supabase
      .from('content_item')
      .select('*')
      .eq('game_key', 'football_logos');

    if (fetchError) {
      console.error('Error fetching logos:', fetchError);
      return;
    }

    // Filter logos that need fixing
    const brokenLogos = allLogos?.filter(logo => {
      const url = logo.payload?.logo_url;
      const status = logo.status;

      // Fix if: paused status, or has wikipedia URL, or no URL at all, or not a working URL
      return status === 'paused' ||
             !url ||
             url.includes('wikipedia') ||
             url.includes('wikimedia') ||
             (!url.includes('gstatic.com') && !url.includes('football-data.org'));
    }) || [];

    if (brokenLogos.length === 0) {
      console.log('No broken logos found');
      return { total: 0, fixed: 0, errors: 0 };
    }

    console.log(`Found ${brokenLogos.length} logos to fix`);
    console.log('First few logos:', brokenLogos.slice(0, 3).map(l => ({
      id: l.id,
      team: l.payload?.answer || l.payload?.answer_en,
      status: l.status,
      url: l.payload?.logo_url,
      payload_keys: Object.keys(l.payload || {})
    })));

    const pausedLogos = brokenLogos; // Rename for compatibility with rest of code

    let fixedCount = 0;
    let errorCount = 0;

    for (const logo of pausedLogos) {
      const teamName = logo.payload?.answer || logo.payload?.answer_en;
      const currentUrl = logo.payload?.logo_url;

      // Skip if already has a working URL
      if (currentUrl && (currentUrl.includes('football-data.org') || currentUrl.includes('crests.football-data.org'))) {
        console.log(`Skipping ${teamName} - already has working URL`);
        continue;
      }

      const newLogoUrl = getWorkingLogoUrl(teamName);

      console.log(`Processing: ${teamName}, Current URL: ${currentUrl}`);

      if (newLogoUrl) {
        // Update the payload with the new logo URL
        const updatedPayload = {
          ...logo.payload,
          logo_url: newLogoUrl
        };

        console.log(`✅ Updating ${teamName} to: ${newLogoUrl}`);

        // Update the content item (keep current status, just fix URL)
        const { error: updateError } = await supabase
          .from('content_item')
          .update({
            payload: updatedPayload,
            // Keep the current status - don't change paused to draft
            status: logo.status,
            active: logo.active
          })
          .eq('id', logo.id);

        if (updateError) {
          console.error(`Error updating logo for ${teamName}:`, updateError);
          errorCount++;
        } else {
          console.log(`✓ Fixed logo for ${teamName}`);
          fixedCount++;

          // Verify the update worked
          const { data: verifyData } = await supabase
            .from('content_item')
            .select('payload')
            .eq('id', logo.id)
            .single();

          console.log(`Verification - ${teamName} now has URL: ${verifyData?.payload?.logo_url}`);
        }
      } else {
        console.warn(`No replacement URL found for "${teamName}" - available teams:`, Object.keys(logoUrlMapping));
        errorCount++;
      }
    }

    console.log(`\nSummary:`);
    console.log(`- Total logos processed: ${pausedLogos.length}`);
    console.log(`- Successfully fixed: ${fixedCount}`);
    console.log(`- Errors: ${errorCount}`);

    return {
      total: pausedLogos.length,
      fixed: fixedCount,
      errors: errorCount
    };
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}