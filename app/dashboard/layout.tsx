import type {Metadata} from "next";
export const metadata:Metadata={title:"My saved plans",description:"Review and compare your financing plans saved on this device.",robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return children;}
