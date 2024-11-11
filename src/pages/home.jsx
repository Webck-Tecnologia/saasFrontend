import { Button } from "@/components/ui/button"
import { MountainIcon } from "lucide-react"
import { Link } from "react-router-dom";
 const HomePage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <Link to="/auth">
                <Button>
                    <MountainIcon />
                    <span>Login</span>
                </Button>
            </Link>
            <br/>
            <Link to="/app">
                <Button>
                    <MountainIcon />
                    <span>Aplicativo</span>
                </Button>
            </Link>
        </div>
    )
}

export default HomePage;
