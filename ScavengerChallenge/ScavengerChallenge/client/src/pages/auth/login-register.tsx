import { useState } from 'react';
import { useLocation } from 'wouter';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginRegisterPage() {
  const [_, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('login');

  const handleSuccess = () => {
    setLocation('/');
  };

  return (
    <div className="bg-neutral-100 min-h-screen flex items-center justify-center">
      <div className="container max-w-md px-4 py-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Scavenger Hunt</CardTitle>
            <CardDescription>
              Login or create an account to start your adventure!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm onSuccess={handleSuccess} />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm onSuccess={() => setActiveTab('login')} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}