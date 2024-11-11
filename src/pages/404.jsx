import { Link } from 'react-router-dom'

export default function NotFoundPage() {
    return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
            <img
                src="/404.webp"
                alt="404 Illustration"
                className="mx-auto mb-6 h-[300px] w-[300px]"
                width="300"
                height="300"
                style={{ aspectRatio: "300/300", objectFit: "cover" }}
            />
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Oops, essa página foi devorada!</h1>
            <p className="mt-4 text-muted-foreground">
                A página que você está procurando acaba de ser devorada pelo monstro.
            </p>
            <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Voltar para a página inicial
          </Link>
        </div>
            </div>
        </div>
    )
}