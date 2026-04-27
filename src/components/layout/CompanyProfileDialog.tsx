"use client";

import { useState, useRef, useEffect } from 'react';
import { useCompanyStore } from '@/stores/company-store';
import { LogoStorage } from '@/lib/storage/idb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Upload, Trash2, Globe, Mail, Phone, MapPin } from 'lucide-react';

export function CompanyProfileDialog() {
  const { profile, setProfile } = useCompanyStore();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile.logoId) {
      LogoStorage.getLogo(profile.logoId).then((record) => {
        if (record) {
          const url = URL.createObjectURL(record.data);
          setLogoUrl(url);
        }
      });
    }
  }, [profile.logoId]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profile.logoId) {
      await LogoStorage.saveLogo(profile.logoId, file);
      if (logoUrl) URL.revokeObjectURL(logoUrl);
      setLogoUrl(URL.createObjectURL(file));
    }
  };

  const deleteLogo = async () => {
    if (profile.logoId) {
      await LogoStorage.deleteLogo(profile.logoId);
      if (logoUrl) URL.revokeObjectURL(logoUrl);
      setLogoUrl(null);
    }
  };

  return (
    <Dialog>
      <DialogTrigger render={
        <Button variant="outline" className="w-full justify-start text-xs h-8" size="sm">
          <Building2 className="h-3.5 w-3.5 mr-2" /> Company Profile
        </Button>
      } />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Company Branding</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden relative group bg-muted/30">
              {logoUrl ? (
                <>
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()} className="text-white">
                      <Upload className="h-5 w-5" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={deleteLogo} className="text-white hover:text-destructive">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </>
              ) : (
                <Button variant="ghost" className="flex flex-col gap-2 h-full w-full" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground font-medium">UPLOAD LOGO</span>
                </Button>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
            <p className="text-[10px] text-muted-foreground text-center">
              Logo is saved locally in your browser (IndexedDB).<br/>Stay lean when sharing quote links.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-1">
              <Label htmlFor="name" className="text-xs uppercase font-bold text-muted-foreground">Company Name</Label>
              <div className="relative">
                <Building2 className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  id="name" 
                  className="pl-8 text-sm" 
                  value={profile.name} 
                  onChange={(e) => setProfile({ name: e.target.value })}
                  placeholder="ACME Surveys Inc."
                />
              </div>
            </div>

            <div className="grid gap-1">
              <Label htmlFor="address" className="text-xs uppercase font-bold text-muted-foreground">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  id="address" 
                  className="pl-8 text-sm" 
                  value={profile.address} 
                  onChange={(e) => setProfile({ address: e.target.value })}
                  placeholder="123 Geodetic St., Manila"
                />
              </div>
            </div>

            <div className="grid gap-4 grid-cols-2">
              <div className="grid gap-1">
                <Label htmlFor="contact" className="text-xs uppercase font-bold text-muted-foreground">Contact</Label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input 
                    id="contact" 
                    className="pl-8 text-sm" 
                    value={profile.contact} 
                    onChange={(e) => setProfile({ contact: e.target.value })}
                    placeholder="+63 912..."
                  />
                </div>
              </div>
              <div className="grid gap-1">
                <Label htmlFor="email" className="text-xs uppercase font-bold text-muted-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input 
                    id="email" 
                    className="pl-8 text-sm" 
                    value={profile.email} 
                    onChange={(e) => setProfile({ email: e.target.value })}
                    placeholder="contact@acme.com"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-1">
              <Label htmlFor="website" className="text-xs uppercase font-bold text-muted-foreground">Website</Label>
              <div className="relative">
                <Globe className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  id="website" 
                  className="pl-8 text-sm" 
                  value={profile.website} 
                  onChange={(e) => setProfile({ website: e.target.value })}
                  placeholder="www.acmesurveys.ph"
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
