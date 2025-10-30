import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface BookDetails {
  title: string;
  authors?: Array<{ name: string }>;
  covers?: number[];
  description?: string | { value: string };
  subjects?: string[];
  first_publish_date?: string;
  number_of_pages?: number;
}

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInList, setIsInList] = useState(false);
  const { toast } = useToast();

  // Check if book is already in list
  useEffect(() => {
    if (!id) return;
    const myList: string[] = JSON.parse(localStorage.getItem("myBookList") || "[]");
    setIsInList(myList.some((bookId: string) => bookId === id));
  }, [id]);

  const handleAddToList = () => {
    if (!id) return;
    const myList: string[] = JSON.parse(localStorage.getItem("myBookList") || "[]");
    
    if (isInList) {
      // Remove from list
      const updatedList = myList.filter((bookId: string) => bookId !== id);
      localStorage.setItem("myBookList", JSON.stringify(updatedList));
      setIsInList(false);
      toast({
        title: "Removed from list",
        description: "Book has been removed from your list.",
      });
    } else {
      // Add to list
      myList.push(id);
      localStorage.setItem("myBookList", JSON.stringify(myList));
      setIsInList(true);
      toast({
        title: "Added to list",
        description: "Book has been added to your list.",
      });
    }
  };

  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://openlibrary.org/works/${id}.json`);
        const data = await response.json();
        setBook(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch book details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookDetails();
    }
  }, [id, toast]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8 max-w-7xl mx-auto">
        <div className="h-8 w-32 bg-muted rounded" />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-80 aspect-[2/3] bg-muted rounded-lg" />
          <div className="flex-1 space-y-4">
            <div className="h-10 bg-muted rounded w-3/4" />
            <div className="h-6 bg-muted rounded w-1/4" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">Book not found.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const coverUrl = book.covers?.[0]
    ? `https://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg`
    : undefined;

  const description =
    typeof book.description === "string"
      ? book.description
      : book.description?.value || "No description available.";

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <div className="relative">
        {/* Hero Background */}
        {coverUrl && (
          <div className="absolute inset-0 -z-10 opacity-20 blur-3xl">
            <img
              src={coverUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover Image */}
          <div className="w-full md:w-80 shrink-0">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={book.title}
                className="w-full aspect-[2/3] object-cover rounded-lg shadow-glow"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">No Cover</span>
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {book.title}
              </h1>
              {book.authors && book.authors.length > 0 && (
                <p className="text-xl text-muted-foreground">
                  by {book.authors[0].name}
                </p>
              )}
              {book.first_publish_date && (
                <p className="text-muted-foreground mt-2">
                  {book.first_publish_date}
                </p>
              )}
            </div>

            <Card className="bg-card/50 border-border p-6">
              <div className="flex flex-wrap gap-6 items-center">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-2xl font-bold mb-1">
                    <Star className="w-6 h-6 fill-primary text-primary" />
                    <span className="text-primary">8.5</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Score</p>
                </div>
                <div className="h-12 w-px bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold mb-1">1,234</div>
                  <p className="text-sm text-muted-foreground">Favorites</p>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <Button 
                    className="w-full gap-2" 
                    size="lg"
                    onClick={handleAddToList}
                    variant={isInList ? "secondary" : "default"}
                  >
                    {isInList && <Check className="w-5 h-5" />}
                    {isInList ? "In List" : "Add to List"}
                  </Button>
                </div>
              </div>
            </Card>

            {book.subjects && book.subjects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {book.subjects.slice(0, 8).map((subject) => (
                  <Badge key={subject} variant="secondary">
                    {subject}
                  </Badge>
                ))}
              </div>
            )}

            {book.number_of_pages && (
              <p className="text-muted-foreground">
                <span className="font-semibold">Pages:</span> {book.number_of_pages}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Synopsis */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Synopsis</h2>
        <Card className="bg-card/50 border-border p-6">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {description}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default BookDetails;
