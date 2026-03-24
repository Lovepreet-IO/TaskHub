const Card = ({ title, value, color = "gray" }: any) => {
    const colors: any = {
        yellow: "bg-yellow-500/20 text-yellow-300",
        blue: "bg-blue-500/20 text-blue-300",
        green: "bg-green-500/20 text-green-300",
        default: "bg-white/10",
        purple: "bg-purple-500/20 text-purple-300",
        red: "bg-red-500/20 text-red-300",
    };

    return (
        <div className={`${colors[color]} p-6 rounded-xl text-center shadow-md hover:scale-105 transition`}>
            <p className="text-sm opacity-80">{title}</p>
            <h2 className="text-3xl font-bold mt-2">{value ?? 0}</h2>
        </div>
    );
};


export default Card ;