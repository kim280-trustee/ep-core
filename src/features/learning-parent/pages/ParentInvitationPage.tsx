import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/core/auth";
import { supabase } from "@/core/infrastructure/supabase/client";
import { learningParentService } from "../services/learning-parent.service";

export default function ParentInvitationPage(){
  const {user}=useAuth(); const navigate=useNavigate(); const [status,setStatus]=useState("Accepting your parent invitation..."); const [error,setError]=useState("");
  useEffect(()=>{let active=true;(async()=>{
    const session=(await supabase.auth.getSession()).data.session;
    const invitationId=session?.user?.user_metadata?.parent_invitation_id;
    if(!session||!invitationId){if(active){setError("This invitation could not be opened. Please use the invitation email link and sign in with the invited email address.");setStatus("");}return;}
    try{await learningParentService.acceptInvitation(String(invitationId));if(active){setStatus("Invitation accepted. Redirecting to the parent portal...");setTimeout(()=>navigate("/parent",{replace:true}),500);}}
    catch(e){if(active){setError(e instanceof Error?e.message:"The invitation could not be accepted.");setStatus("");}}
  })();return()=>{active=false}},[navigate]);
  return <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center">{status&&<p className="font-semibold text-slate-900">{status}</p>}{error&&<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}</div>;
}