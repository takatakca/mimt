/**
 * Emits a real HTML comment in the exported page so reviewers can find every text that a
 * lawyer must approve before launch (view source / grep "à valider par l'avocat" in out/).
 */
export function LegalReview({ note }: { note: string }) {
  const safe = note.replace(/--/g, "—");
  return <div hidden dangerouslySetInnerHTML={{ __html: `<!-- à valider par l'avocat : ${safe} -->` }} />;
}
