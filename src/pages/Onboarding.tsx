import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Brain, Camera, Twitter, Instagram, Linkedin, Upload } from "lucide-react";
import { motion } from "framer-motion";

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate("/auth"); return; }
    if (!username.trim()) { toast.error("Username is required"); return; }

    setLoading(true);
    try {
      let avatarUrl: string | null = null;

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const path = `${user.id}/avatar.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });
        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
        avatarUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          username: username.trim(),
          avatar_url: avatarUrl,
          twitter_url: twitter.trim() || null,
          instagram_url: instagram.trim() || null,
          linkedin_url: linkedin.trim() || null,
          tiktok_url: tiktok.trim() || null,
          onboarding_complete: true,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Profile set up!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg space-y-8"
      >
        <div className="text-center">
          <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gradient-gold">Set Up Your Profile</h1>
          <p className="text-muted-foreground mt-2">Complete your neural identity</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative h-24 w-24 rounded-full border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors flex items-center justify-center overflow-hidden bg-muted"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <Camera className="h-8 w-8 text-muted-foreground" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground">Tap to upload profile picture</p>
          </div>

          {/* Username */}
          <div>
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Choose your identity"
              required
              maxLength={30}
            />
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Social Links <span className="text-muted-foreground font-normal">(optional)</span></p>
            
            <div className="flex items-center gap-2">
              <Twitter className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="twitter.com/username" maxLength={100} />
            </div>
            <div className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="instagram.com/username" maxLength={100} />
            </div>
            <div className="flex items-center gap-2">
              <Linkedin className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="linkedin.com/in/username" maxLength={100} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs font-bold shrink-0 w-4 text-center">T</span>
              <Input value={tiktok} onChange={e => setTiktok(e.target.value)} placeholder="tiktok.com/@username" maxLength={100} />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Setting up..." : "Complete Profile"}
          </Button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        </form>
      </motion.div>
    </div>
  );
}
