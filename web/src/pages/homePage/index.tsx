import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import daLogo from "../../assets/  daLogo.png";
import { ExpertHomePage } from "./expert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CustomerHomePage } from "./customer";
import { useTelegram } from "@/hooks/useTelegram";
import { useEffect } from "react";

// Home page component
export function HomePage() {
  const navigate = useNavigate();
  const { user, userId, username, firstName, lastName } = useTelegram();
  const test = "expert1";
  
  useEffect(() => {
    if (user) {
      console.log('Telegram User ID:', userId);
      console.log('Telegram User:', user);
    }
  }, [user, userId]);
  return (
    <div>
      <div className="flex items-center justify-between">
        <div><img src={daLogo} alt="Logo" className="h-10" /></div>
        <h1 className="text-2xl font-bold">Мои записи</h1>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>SH</AvatarFallback>
        </Avatar>
      </div>
      
      {/* Display Telegram user information */}
      <div className="mt-4 p-4 bg-slate-100 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Telegram User Info:</h2>
        <p><strong>User ID:</strong> {userId || 'Not available'}</p>
        <p><strong>Username:</strong> {username || 'Not available'}</p>
        <p><strong>Name:</strong> {firstName} {lastName}</p>
      </div>
      
      {test === "expert" ? <ExpertHomePage /> : <CustomerHomePage />}
    </div>
  )
}