
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { InfoIcon, AlertTriangle, Download, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/auth/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from '@/components/ui/sonner';
import { generate2FASecret, verify2FAToken, disable2FA, saveQRCodeFile } from '@/integrations/supabase/client';
import { Loading } from '@/components/ui/loading';

export default function TwoFactorAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, sessionChecked, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [isLoading, setIsLoading] = useState(true);
  const [has2FAEnabled, setHas2FAEnabled] = useState(false);
  const [isSetting2FA, setIsSetting2FA] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState('');
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if user has 2FA enabled
  useEffect(() => {
    async function checkTwoFactorStatus() {
      if (!isAuthenticated || !user) {
        return;
      }

      try {
        setIsLoading(true);
        const { data } = await supabase
          .from('users')
          .select('two_factor_enabled')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setHas2FAEnabled(!!data.two_factor_enabled);
        }
      } catch (error) {
        console.error('Error checking 2FA status:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (isAuthenticated && user) {
      checkTwoFactorStatus();
    }
  }, [isAuthenticated, user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (sessionChecked && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, sessionChecked]);

  // Generate new 2FA setup
  const handleSetup2FA = async () => {
    if (!user) return;
    
    try {
      setIsSetting2FA(true);
      setErrorMessage(null);
      
      // Generate a new 2FA secret
      const result = await generate2FASecret(user.id, user.email);
      
      // Update state with the new secret and QR code
      setSecret(result.secret);
      setQrCodeUrl(result.qrCodeDataUrl);
      
      // Show verification dialog
      setShowVerifyDialog(true);
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      setErrorMessage('حدث خطأ أثناء إعداد المصادقة الثنائية. يرجى المحاولة مرة أخرى.');
      toast(t("error"), {
        description: t("twoFactorSetupError")
      });
    } finally {
      setIsSetting2FA(false);
    }
  };

  // Save QR code as image file
  const handleSaveQRCode = async () => {
    if (!qrCodeUrl || !user) return;
    
    try {
      setIsProcessing(true);
      const result = await saveQRCodeFile(user.id, qrCodeUrl);
      
      if (result.success) {
        toast(t("success"), {
          description: t("qrCodeSaved")
        });
        
        // Open the QR code in a new tab for download
        window.open(result.url, '_blank');
      }
    } catch (error) {
      console.error('Error saving QR code:', error);
      toast(t("error"), {
        description: t("qrCodeSaveError")
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Verify code and enable 2FA
  const handleVerifyCode = async () => {
    if (!user) return;
    if (verificationCode.length !== 6) {
      toast(t("error"), {
        description: t("invalidVerificationCode")
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      const isValid = await verify2FAToken(user.id, verificationCode);
      
      if (isValid) {
        setHas2FAEnabled(true);
        setShowVerifyDialog(false);
        toast(t("success"), {
          description: t("twoFactorEnabled")
        });
        
        // Save QR code file automatically
        if (qrCodeUrl) {
          await saveQRCodeFile(user.id, qrCodeUrl);
        }
      } else {
        toast(t("error"), {
          description: t("invalidVerificationCode")
        });
      }
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
      toast(t("error"), {
        description: t("verificationError")
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Disable 2FA
  const handleDisable2FA = async () => {
    if (!user) return;
    
    try {
      setIsProcessing(true);
      const success = await disable2FA(user.id);
      
      if (success) {
        setHas2FAEnabled(false);
        setShowDisableDialog(false);
        toast(t("success"), {
          description: t("twoFactorDisabled")
        });
      } else {
        toast(t("error"), {
          description: t("disableError")
        });
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast(t("error"), {
        description: t("disableError")
      });
    } finally {
      setIsProcessing(false);
      setDisableCode('');
    }
  };

  // Cancel setup
  const handleCancelSetup = () => {
    setShowVerifyDialog(false);
    setVerificationCode('');
    setQrCodeUrl(null);
    setSecret('');
  };

  if (authLoading || isLoading) {
    return <Loading text={t("loading") || "جاري التحميل..."} className="min-h-screen" />;
  }

  return (
    <div className="container max-w-3xl py-6">
      <h1 className="text-2xl font-bold mb-6">{t("twoFactorAuthentication")}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>{t("twoFactorSecurity")}</CardTitle>
          <CardDescription>
            {t("twoFactorDescription")}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <Switch 
              id="2fa-switch" 
              checked={has2FAEnabled} 
              onCheckedChange={(isChecked) => {
                if (isChecked) {
                  handleSetup2FA();
                } else {
                  setShowDisableDialog(true);
                }
              }} 
            />
            <Label htmlFor="2fa-switch">{t("enable2FA")}</Label>
          </div>
          
          {has2FAEnabled && (
            <Alert className="mt-4 bg-green-50 dark:bg-green-900/20">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle className="text-green-800 dark:text-green-400">
                {t("twoFactorEnabled")}
              </AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-300">
                {t("twoFactorEnabledDescription")}
              </AlertDescription>
            </Alert>
          )}
          
          {!has2FAEnabled && (
            <Alert className="mt-4 bg-orange-50 dark:bg-orange-900/20">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <AlertTitle className="text-orange-800 dark:text-orange-400">
                {t("twoFactorNotEnabled")}
              </AlertTitle>
              <AlertDescription className="text-orange-700 dark:text-orange-300">
                {t("twoFactorNotEnabledDescription")}
              </AlertDescription>
            </Alert>
          )}
          
          {errorMessage && (
            <Alert className="mt-4 bg-red-50 dark:bg-red-900/20">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertTitle className="text-red-800 dark:text-red-400">
                {t("error")}
              </AlertTitle>
              <AlertDescription className="text-red-700 dark:text-red-300">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground flex items-center">
            <InfoIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t("twoFactorNote")}
          </div>
        </CardFooter>
      </Card>
      
      {/* Verification Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("setup2FA")}</DialogTitle>
            <DialogDescription>{t("setup2FADescription")}</DialogDescription>
          </DialogHeader>
          
          {qrCodeUrl && (
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="border rounded p-4 bg-white">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code for 2FA" 
                  className="w-64 h-64"
                />
              </div>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center" 
                onClick={handleSaveQRCode}
                disabled={isProcessing}
              >
                <Download className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                {t("saveQRCode")}
              </Button>
              
              {secret && (
                <div className="w-full text-center">
                  <p className="text-sm text-muted-foreground mb-1">{t("secretKey")}</p>
                  <p className="font-mono bg-muted p-2 rounded text-sm break-all">
                    {secret}
                  </p>
                </div>
              )}
              
              <div className="w-full space-y-2">
                <Label>{t("verificationCode")}</Label>
                <InputOTP 
                  maxLength={6} 
                  value={verificationCode}
                  onChange={setVerificationCode}
                  disabled={isProcessing}
                  className="justify-center"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={handleCancelSetup}
              disabled={isProcessing}
            >
              {t("cancel")}
            </Button>
            <Button 
              onClick={handleVerifyCode}
              disabled={verificationCode.length !== 6 || isProcessing}
            >
              {isProcessing ? t("verifying") : t("verify")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Disable 2FA Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("disable2FA")}</DialogTitle>
            <DialogDescription>{t("disable2FADescription")}</DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4 py-4">
            <Alert className="bg-red-50 dark:bg-red-900/20">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertTitle className="text-red-800 dark:text-red-400">
                {t("warning")}
              </AlertTitle>
              <AlertDescription className="text-red-700 dark:text-red-300">
                {t("disable2FAWarning")}
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setShowDisableDialog(false);
                setDisableCode('');
              }}
              disabled={isProcessing}
            >
              {t("cancel")}
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDisable2FA}
              disabled={isProcessing}
            >
              {isProcessing ? t("disabling") : t("disable")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
