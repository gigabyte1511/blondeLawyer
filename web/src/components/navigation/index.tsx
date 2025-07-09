import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Don't show navigation on home page
  if (location.pathname === "/") {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-100">
      {location.pathname !== "/" && (
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(-1)}
          title="Назад"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => navigate("/")}
        title="На главную"
      >
        <Home className="h-5 w-5" />
      </Button>
      <div className="ml-2 font-medium">
        {location.pathname === "/expert" && "Панель эксперта"}
        {location.pathname === "/customer" && "Панель клиента"}
        {location.pathname === "/consultation" && "Детали консультации"}
      </div>
    </div>
  );
}
