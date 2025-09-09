export function mergeKBIntoSkeleton(skeleton: string, kb: string): string {
  if (!kb?.trim()) {
    throw new Error('Empty KB provided');
  }
  
  const hasSection = /##\s*Knowledge Base/i.test(skeleton);
  
  if (hasSection) {
    return skeleton.replace(
      /##\s*Knowledge Base[\s\S]*?(?=(\n#|\n##|\n$))/i,
      `## Knowledge Base\n\n${kb}\n\n`
    );
  }
  
  return `${skeleton}\n\n## Knowledge Base\n\n${kb}\n`;
}
