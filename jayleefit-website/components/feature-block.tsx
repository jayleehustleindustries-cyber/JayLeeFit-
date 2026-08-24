export interface FeatureBlockProps {
  icon: string;
  title: string;
  description: string;
}

export default function FeatureBlock({
  icon,
  title,
  description,
}: FeatureBlockProps) {
  return (
    <div className="bg-dark-secondary p-8 rounded-lg border border-accent/20 hover:border-accent/50 transition-smooth">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-serif font-bold text-accent mb-3">
        {title}
      </h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}
