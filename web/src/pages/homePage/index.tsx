import { ExpertHomePage } from "../expert";
import { CustomerHomePage } from "../customer";

// Home page component
export function HomePage() {

  const test = 'expert'
  if(test === "expert"){
    return (
        <div>
            <ExpertHomePage/>
        </div>
    )
  }
  else {
    return (
        <div>
            <CustomerHomePage/>
        </div>
    )
  }
}