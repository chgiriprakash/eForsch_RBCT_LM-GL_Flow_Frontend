import { library } from '@fortawesome/fontawesome-svg-core';
import { faDolly, faRightFromBracket, faHouse, faGears, faUsers, faShareFromSquare, faClipboardList } from '@fortawesome/free-solid-svg-icons';
import SummaryCards from '../compoenents/SummaryCards';


// Add icons to the library so they can be used in components
library.add(faDolly, faGears, faUsers, faRightFromBracket, faHouse, faShareFromSquare, faClipboardList);

const Home = () => {
  return (
    <>
      <SummaryCards />
    </>
  )
};
  
export default Home;
  