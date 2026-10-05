import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response(JSON.stringify({error:"Method not allowed"}),{status:405,headers:{"Content-Type":"application/json"}});
  try {
    const authHeader=req.headers.get("Authorization"); if(!authHeader) return new Response(JSON.stringify({error:"Authentication is required"}),{status:401,headers:{"Content-Type":"application/json"}});
    const body=await req.json(); const organizationId=String(body.organizationId??""); const parentEmail=String(body.parentEmail??"").trim().toLowerCase(); const parentName=String(body.parentName??"").trim(); const studentUserId=String(body.studentUserId??""); const relationship=String(body.relationship??"parent").trim()||"parent";
    if(!organizationId||!parentEmail||!studentUserId||!parentEmail.includes("@")) return new Response(JSON.stringify({error:"Organization, parent email, and student are required"}),{status:400,headers:{"Content-Type":"application/json"}});
    const supabaseUrl=Deno.env.get("SUPABASE_URL")!; const anonKey=Deno.env.get("SUPABASE_ANON_KEY")!; const secretKey=Deno.env.get("SUPABASE_SECRET_KEY")??Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"); if(!secretKey) throw new Error("Supabase server secret is not configured");
    const userClient=createClient(supabaseUrl,anonKey,{global:{headers:{Authorization:authHeader}},auth:{persistSession:false,autoRefreshToken:false}});
    const {data:invitationId,error:invitationError}=await userClient.rpc("create_learning_parent_invitation",{p_organization_id:organizationId,p_parent_email:parentEmail,p_parent_name:parentName||null,p_student_user_id:studentUserId,p_relationship:relationship}); if(invitationError) throw invitationError;
    const admin=createClient(supabaseUrl,secretKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
    const origin=req.headers.get("Origin")??Deno.env.get("APP_URL")??supabaseUrl; const redirectTo=new URL("/parent/invite",origin).toString();
    const {error:inviteError}=await admin.auth.admin.inviteUserByEmail(parentEmail,{data:{name:parentName||undefined,parent_invitation_id:invitationId},redirectTo});
    if(inviteError) return new Response(JSON.stringify({error:inviteError.message,invitationId}),{status:400,headers:{"Content-Type":"application/json"}});
    return new Response(JSON.stringify({invitationId,sent:true}),{status:200,headers:{"Content-Type":"application/json"}});
  } catch(error) { return new Response(JSON.stringify({error:error instanceof Error?error.message:"Parent invitation failed"}),{status:400,headers:{"Content-Type":"application/json"}}); }
});