"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiPlus, FiUser, FiPhone, FiKey, FiUserCheck, FiEdit, FiTrash, FiLock, FiMoreVertical } from "react-icons/fi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuthService, SignupDto, UpdateUserDto, ResetPasswordDto, DeleteUserDto } from "../../../../../../client";
import { getErrorMessage } from "@/lib/error-handler";
import { useUser } from "@/app/contexts/UserContext";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mobileNumber: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^07\d{8}$/, "Mobile number must be 10 digits starting with 07"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["SUPERVISOR"], {
    required_error: "Role is required",
  }),
});

type UserFormData = z.infer<typeof userSchema>;

const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  mobileNumber: z
    .string()
    .regex(/^07\d{8}$/, "Mobile number must be 10 digits starting with 07")
    .optional(),
});

type UpdateUserFormData = z.infer<typeof updateUserSchema>;

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function UsersTab() {
  const { isAdmin } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      mobileNumber: "",
      password: "",
      role: "SUPERVISOR",
    },
  });

  const updateForm = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: "",
      mobileNumber: "",
    },
  });

  const resetPasswordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
    },
  });

  // Fetch existing supervisor users
  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const supervisors = await AuthService.authControllerGetSupervisors();
        setUsers(supervisors);
      } catch (error) {
        console.error("Error fetching supervisors:", error);
      }
    };

    fetchSupervisors();
  }, []);

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    try {
      const signupData: SignupDto = {
        name: data.name,
        mobileNumber: data.mobileNumber,
        password: data.password,
        role: SignupDto.role.SUPERVISOR,
      };

      await AuthService.authControllerSignup({
        requestBody: signupData,
      });

      // Refresh the users list
      const supervisors = await AuthService.authControllerGetSupervisors();
      setUsers(supervisors);
      
      setIsDialogOpen(false);
      form.reset();
      
      // Show success message
      alert("User created successfully!");
    } catch (error) {
      console.error("Error creating user:", error);
      alert(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const onUpdateSubmit = async (data: UpdateUserFormData) => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      const updateData: UpdateUserDto = {
        userId: selectedUser.userId,
      };
      if (data.name) updateData.name = data.name;
      if (data.mobileNumber && data.mobileNumber !== selectedUser.mobileNumber) {
        updateData.mobileNumber = data.mobileNumber;
      }

      await AuthService.authControllerUpdateUser({
        requestBody: updateData,
      });

      // Refresh the users list
      const supervisors = await AuthService.authControllerGetSupervisors();
      setUsers(supervisors);
      
      setIsUpdateDialogOpen(false);
      updateForm.reset();
      setSelectedUser(null);
      
      alert("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      alert(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPasswordSubmit = async (data: ResetPasswordFormData) => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      const resetData: ResetPasswordDto = {
        mobileNumber: selectedUser.mobileNumber,
        newPassword: data.newPassword,
      };

      await AuthService.authControllerResetPassword({
        requestBody: resetData,
      });
      
      setIsResetPasswordDialogOpen(false);
      resetPasswordForm.reset();
      setSelectedUser(null);
      
      alert("Password reset successfully!");
    } catch (error) {
      console.error("Error resetting password:", error);
      alert(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const onDeleteUser = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      const deleteData: DeleteUserDto = {
        mobileNumber: selectedUser.mobileNumber,
      };

      await AuthService.authControllerDeleteUser({
        requestBody: deleteData,
      });

      // Refresh the users list
      const supervisors = await AuthService.authControllerGetSupervisors();
      setUsers(supervisors);
      
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      
      alert("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">User Management</h2>
          <p className="text-sm text-muted-foreground">
            Create and manage supervisor user accounts
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FiPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <FiUser className="mr-2 h-5 w-5" />
                Create New User
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <FiUser className="mr-1 h-4 w-4" />
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter full name"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <FiPhone className="mr-1 h-4 w-4" />
                        Mobile Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="07XXXXXXXX"
                          disabled={isLoading}
                          maxLength={10}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <FiKey className="mr-1 h-4 w-4" />
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Minimum 6 characters"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={() => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <FiUserCheck className="mr-1 h-4 w-4" />
                        Role
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">SUPERVISOR</Badge>
                          <span className="text-sm text-muted-foreground">
                            (Only supervisors can be created)
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {users.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FiUser className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No Users Created</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Create your first supervisor user to get started. Users created here will be able to log in and manage the system.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user.userId}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <FiUser className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{user.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <FiPhone className="h-3 w-3" />
                          <span>{user.mobileNumber}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{user.role}</Badge>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {isAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <FiMoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                updateForm.setValue('name', user.name);
                                updateForm.setValue('mobileNumber', user.mobileNumber);
                                setIsUpdateDialogOpen(true);
                              }}
                            >
                              <FiEdit className="mr-2 h-4 w-4" />
                              Update User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setIsResetPasswordDialogOpen(true);
                              }}
                            >
                              <FiLock className="mr-2 h-4 w-4" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <FiTrash className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Info Card */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <FiUser className="mr-2 h-4 w-4" />
            User Management Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Only SUPERVISOR role users can be created through this interface</p>
          <p>• ADMIN users must be created through other means for security</p>
          <p>• Mobile numbers must be unique and follow Jordanian format (07XXXXXXXX)</p>
          <p>• Users will be able to log in immediately after creation</p>
          {isAdmin && (
            <>
              <p>• As an admin, you can update, delete, or reset passwords for users</p>
              <p>• Use the actions menu (⋮) on each user card to manage them</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Update User Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FiEdit className="mr-2 h-5 w-5" />
              Update User
            </DialogTitle>
            <DialogDescription>
              Update user information for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
              <FormField
                control={updateForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <FiUser className="mr-1 h-4 w-4" />
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter full name"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={updateForm.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <FiPhone className="mr-1 h-4 w-4" />
                      Mobile Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="07XXXXXXXX"
                        disabled={isLoading}
                        maxLength={10}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsUpdateDialogOpen(false);
                    updateForm.reset();
                    setSelectedUser(null);
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update User"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FiLock className="mr-2 h-5 w-5" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Reset password for {selectedUser?.name} ({selectedUser?.mobileNumber})
            </DialogDescription>
          </DialogHeader>
          <Form {...resetPasswordForm}>
            <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
              <FormField
                control={resetPasswordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <FiKey className="mr-1 h-4 w-4" />
                      New Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Minimum 6 characters"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsResetPasswordDialogOpen(false);
                    resetPasswordForm.reset();
                    setSelectedUser(null);
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <FiTrash className="mr-2 h-5 w-5" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedUser(null);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={onDeleteUser}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}