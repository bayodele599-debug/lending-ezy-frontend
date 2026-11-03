import type {Metadata} from "next";
import AccountWorkspace from "../../components/account-workspace";
export const metadata:Metadata={title:"Customer account",description:"Your private financing planning and request workspace",robots:{index:false,follow:false}};
export default function Account(){return <AccountWorkspace/>;}
