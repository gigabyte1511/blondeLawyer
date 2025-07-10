import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import daLogo from "../../assets/  daLogo.png";
import { ExpertHomePage } from "./expert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CustomerHomePage } from "./customer";
import { useTelegram } from "@/hooks/useTelegram";
// import { useUser } from "@/providers/UserProvider";
import { useQuery } from "@tanstack/react-query";
import api from "@/api";

// Home page component
export function HomePage() {
  const navigate = useNavigate();
  const { telegramUser, webApp } = useTelegram();
  
  // Use Tanstack Query to fetch user by Telegram ID
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['user', telegramUser?.id],
    queryFn: async () => {
      if (!telegramUser?.id) return null;
      try {
        const response = await api.getUserByTelegramId(telegramUser.id);
        return response.user;
      } catch (err) {
        console.error('Error fetching user:', err);
        throw err;
      }
    },
    enabled: !!telegramUser?.id, // Only run query when telegramUser.id exists
  });
  
  // Determine user role from fetched data
  const role = userData?.role || 'unknown';
  const isExpert = role === 'expert';
  
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
        <p><strong>User Telegram ID:</strong> {telegramUser?.id || 'Not available'}</p>
        <p><strong>Username:</strong> {telegramUser?.username || 'Not available'}</p>
        <p><strong>Name:</strong> {telegramUser?.first_name} {telegramUser?.last_name}</p>
        <p><strong>Role:</strong> {isLoading ? 'Loading...' : role}</p>
        {error && <p className="text-red-500">Error loading user data</p>}
        {userData && (
          <div className="mt-2">
            <p><strong>User ID:</strong> {userData.id}</p>
            <p><strong>Name:</strong> {userData.name}</p>
          </div>
        )}
      </div>
      
      {isExpert ? <ExpertHomePage userData={userData} /> : <CustomerHomePage userData={userData} />}
    </div>
  )
}