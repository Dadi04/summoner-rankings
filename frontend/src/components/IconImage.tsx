
const IconImage: React.FC<{icon: string; alt: string; className?: string}> = ({icon, alt, className = ""}) => (
    <img src={`https://ddragon.leagueoflegends.com/cdn/img/${icon}`} alt={alt} className={className} />
)

export default IconImage;