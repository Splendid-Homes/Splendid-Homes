/** Default wording for the Insights list and article pages (CMS: Insights pages). Blank fields fall back to these. */
export const INSIGHTS_DEFAULTS = {
  // List page
  allLabel: 'All', readMore: 'Read article', minRead: 'min read', prevLabel: 'Newer articles', nextLabel: 'Older articles',
  emptyText: 'No articles in this category yet.',
  // Newsletter box
  nlTitle: 'Get the quarterly market report', nlText: 'Prices, launches and yields for Dubai’s main communities, straight to your inbox.',
  // Article page
  published: 'Published', updated: 'Updated', inShort: 'In short', takeaways: 'Key takeaways', steps: 'Step by step',
  compared: 'Communities compared', comparedCaption: 'Dubai communities compared by price, rent and yield',
  sources: 'Sources', sourcesNote: 'Rules and fees change; this article reflects them as of {date}. Check the official source before acting.',
  faqTitle: 'Frequently asked questions', aboutAuthor: 'About the author', viewProfile: 'View profile',
  formTitle: 'Speak to {first}', formCta: 'Request a call back', formMessage: 'I read "{title}" and would like advice on my situation.',
  relatedEyebrow: 'Keep reading', relatedTitle: 'Related', relatedItalic: 'articles', relatedAll: 'All articles',
};
export type InsightsText = typeof INSIGHTS_DEFAULTS;

export const INSIGHT_CATEGORIES = ['Market Reports', 'Guides', 'Investing', 'Lifestyle', 'Finance', 'News'];
export const COMMUNITY_COLUMNS = ['Community', 'Best for', 'Avg. price / sq ft', 'Avg. annual rent', 'Gross yield'];
