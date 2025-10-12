import Link from "next/link";

export default function Home() {
    return (
        <div id="home" className="flex flex-col min-h-dvh justify-center items-start backdrop-blur-sm pl-[10%]">
            <h1>Chat in 3D</h1>
            <h2>Type a message, and your avatar speaks it out loud.</h2>
            <h2>A whole new way to talk online.</h2>
            <Link href="/experience">
                <button>
                    Start Talking
                </button>
            </Link>
        </div>
    );
}
