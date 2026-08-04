import { ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import PublicNavbar from "./PublicNavbar.jsx";
import LandingFooter from "../../components/landing/LandingFooter.jsx";
import { joinRequestApi } from "../../api/joinRequestApi.js";
import { normalizePhone } from "../../utils/formValues.js";

const empty = { fullName: "", email: "", mobile: "", businessName: "", businessCategory: "", location: "", message: "" };

export default function JoinRequestPage() {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await joinRequestApi.submit(form);
      setSent(true);
      setForm(empty);
      toast.success("Request sent to the admin");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not send request");
    } finally {
      setLoading(false);
    }
  }

  return <div className="public-page"><PublicNavbar/><main className="content-shell section-pad"><div className="mx-auto max-w-3xl"><Link to="/" className="inline-flex items-center gap-2 text-sm text-[#888] hover:text-red-400"><ArrowLeft size={16}/> Back home</Link><div className="glass-card mt-6 rounded-[2rem] p-6 sm:p-10">{sent?<div className="py-10 text-center"><CheckCircle2 className="mx-auto text-red-500" size={56}/><h1 className="mt-6 text-4xl font-bold">Request received.</h1><p className="mx-auto mt-4 max-w-lg leading-7 text-[#b3b3b3]">The admin will review your details, assign the right chapter, and send approved credentials by email.</p></div>:<><p className="eyebrow">Join Networkers</p><h1 className="mt-3 text-4xl font-bold sm:text-5xl">Request your place in the network.</h1><p className="mt-4 leading-7 text-[#b3b3b3]">Share your details and our team will assign the chapter that best fits your location and business.</p><form onSubmit={submit} className="mt-9 grid gap-4 sm:grid-cols-2">{[["fullName","Full name *","text"],["email","Email address *","email"],["mobile","Contact number *","tel"],["location","City / location","text"],["businessName","Business name","text"],["businessCategory","Business category","text"]].map(([key,label,type])=><label key={key}><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#888]">{label}</span><input name={key} required={["fullName","email","mobile"].includes(key)} type={type} className="field" value={form[key]} onChange={({currentTarget:{value}})=>setForm(current=>({...current,[key]:key==="mobile"?normalizePhone(value):value}))}/></label>)}<label className="sm:col-span-2"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#888]">Why would you like to join?</span><textarea rows="4" className="field" value={form.message} onChange={({currentTarget:{value}})=>setForm(current=>({...current,message:value}))}/></label><button disabled={loading} className="glow-button glow-button-primary sm:col-span-2">{loading?<span className="spinner"/>:<Send size={18}/>} {loading?"Sending...":"Send request"}</button></form></>}</div></div></main><LandingFooter/></div>;
}
