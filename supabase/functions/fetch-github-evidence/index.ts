import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { githubUrl } = await req.json();
    
    if (!githubUrl) {
      return new Response(
        JSON.stringify({ error: 'GitHub URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching evidence from GitHub URL: ${githubUrl}`);

    // Parse GitHub URL to extract username/org
    const githubMatch = githubUrl.match(/github\.com\/([^\/]+)\/?$/);
    if (!githubMatch) {
      return new Response(
        JSON.stringify({ error: 'Invalid GitHub URL format. Expected: https://github.com/username' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const username = githubMatch[1];
    console.log(`Extracted username: ${username}`);

    // Fetch user's public repositories
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'HumIQ-Evidence-Fetcher',
        },
      }
    );

    if (!reposResponse.ok) {
      console.error(`GitHub API error: ${reposResponse.status}`);
      return new Response(
        JSON.stringify({ error: `Failed to fetch repositories for ${username}` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const repos = await reposResponse.json();
    console.log(`Found ${repos.length} repositories`);

    // Filter to repos with meaningful content (not forks, have description or stars)
    const relevantRepos = repos
      .filter((repo: any) => !repo.fork && (repo.description || repo.stargazers_count > 0))
      .slice(0, 5); // Limit to top 5 repos

    const evidenceBlocks: string[] = [];

    // Fetch README for each relevant repo
    for (const repo of relevantRepos) {
      console.log(`Fetching README for ${repo.full_name}`);
      
      try {
        const readmeResponse = await fetch(
          `https://api.github.com/repos/${repo.full_name}/readme`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'HumIQ-Evidence-Fetcher',
            },
          }
        );

        if (readmeResponse.ok) {
          const readmeData = await readmeResponse.json();
          const readmeContent = atob(readmeData.content.replace(/\n/g, ''));
          
          // Clean and truncate README content
          const cleanedContent = readmeContent
            .replace(/!\[.*?\]\(.*?\)/g, '') // Remove image markdown
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
            .replace(/```[\s\S]*?```/g, '[code block]') // Summarize code blocks
            .replace(/\n{3,}/g, '\n\n') // Reduce excessive newlines
            .trim()
            .slice(0, 2000); // Limit per-repo content

          if (cleanedContent.length > 100) {
            evidenceBlocks.push(
              `SOURCE: GitHub README — ${repo.name}\n` +
              `Repository: ${repo.full_name}\n` +
              `Stars: ${repo.stargazers_count} | Forks: ${repo.forks_count}\n` +
              `Description: ${repo.description || 'No description'}\n\n` +
              `TEXT:\n${cleanedContent}`
            );
          }
        }
      } catch (readmeError) {
        console.log(`Could not fetch README for ${repo.full_name}: ${readmeError}`);
      }
    }

    // Also add repo descriptions as supplementary evidence
    for (const repo of relevantRepos) {
      if (repo.description && !evidenceBlocks.some(b => b.includes(repo.name))) {
        evidenceBlocks.push(
          `SOURCE: GitHub Repository Description — ${repo.name}\n\n` +
          `TEXT:\n${repo.description}\n` +
          `Language: ${repo.language || 'Not specified'}\n` +
          `Stars: ${repo.stargazers_count} | Forks: ${repo.forks_count}`
        );
      }
    }

    const rawEvidence = evidenceBlocks.join('\n\n---\n\n');
    
    console.log(`Generated ${evidenceBlocks.length} evidence blocks`);

    return new Response(
      JSON.stringify({ 
        success: true,
        username,
        repoCount: relevantRepos.length,
        rawEvidence: rawEvidence || 'No README content found in public repositories.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching GitHub evidence:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch GitHub evidence';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
