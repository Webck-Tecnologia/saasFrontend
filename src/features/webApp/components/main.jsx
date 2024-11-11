import { Link } from "react-router-dom";
import { FaCarCrash, FaWhatsapp } from "react-icons/fa";


export default function Main() {
  return (
    <main className="flex-1 h-full">
      <div className="py-8 sm:px-6 lg:px-8 h-full mx-auto max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          <Link
            to="/app/campanhas"
            className="group relative flex flex-col items-center justify-center overflow-hidden rounded-lg bg-muted p-8 hover:bg-accent hover:text-accent-foreground shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105"
          >
            <div className="flex items-center justify-center">
              <FaWhatsapp className="h-12 w-12" />
            </div>
            <span className="mt-4 text-sm font-semibold">Campanhas</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
