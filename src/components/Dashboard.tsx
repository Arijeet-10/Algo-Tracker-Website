'use client'

import { useEffect, useState } from "react";
import { getCodeforcesUser, getCodeforcesSubmissions } from "@/services/codeforces";
import { getLeetCodeUser, getLeetCodeSubmissions } from "@/services/leetcode";
import { getCodeChefUser, getCodeChefSubmissions } from "@/services/codechef";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CodeforcesUser, CodeforcesSubmission } from "@/services/codeforces";
import { LeetCodeUser, LeetCodeSubmission } from "@/services/leetcode";
import { CodeChefUser, CodeChefSubmission } from "@/services/codechef";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/icons";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  User, 
  FileCode, 
  BarChart2, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon, 
  AlertCircle,
  Trophy,
  Code2,
  Activity,
  Filter
} from "lucide-react";
import _ from 'lodash';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { motion } from "framer-motion";

interface DashboardProps {}

interface PlatformData<User, Submission> {
  handle: string;
  setHandle: React.Dispatch<React.SetStateAction<string>>;
  user: User | null;
  submissions: Submission[];
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
  fetchUser: (username: string) => Promise<void>;
  ratingHistory: { rating: number; timestamp: number }[];
}

const usePlatform = <User, Submission>(
  getUser: (username: string) => Promise<User | null>,
  getSubmissions: (username: string, limit: number) => Promise<Submission[]>,
  getRatingHistory?: (username: string) => Promise<{ rating: number; timestamp: number }[]>
): PlatformData<User, Submission> => {
  const [handle, setHandle] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [ratingHistory, setRatingHistory] = useState<{ rating: number; timestamp: number }[]>([]);

  const fetchUser = async (username: string) => {
    if (username) {
      try {
        const user = await getUser(username);
        const submissions = await getSubmissions(username, 100);
        setUser(user);
        setSubmissions(submissions);
        if (getRatingHistory) {
          const history = await getRatingHistory(username);
          setRatingHistory(history);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  return {
    handle,
    setHandle,
    user,
    submissions,
    setUser,
    setSubmissions,
    ratingHistory,
    fetchUser,
  };
};

const Dashboard: React.FC<DashboardProps> = ({}) => {
  const codeforcesPlatform = usePlatform<CodeforcesUser, CodeforcesSubmission>(
    getCodeforcesUser,
    getCodeforcesSubmissions,
    async (handle: string) => {
      try {
        const response = await fetch(`https://codeforces.com/api/user.rating?handle=${handle}`);
        if (!response.ok) {
          console.error("Failed to fetch Codeforces rating history:", response.status);
          return [];
        }
        const data = await response.json();
        if (data.status !== 'OK' || !data.result) {
          return [];
        }
        return data.result.map((ratingChange: any) => ({
          rating: ratingChange.newRating,
          timestamp: ratingChange.ratingUpdateTimeSeconds,
        }));
      } catch (error) {
        console.error("Failed to fetch Codeforces rating history:", error);
        return [];
      }
    }
  );
  const leetcodePlatform = usePlatform<LeetCodeUser, LeetCodeSubmission>(
    getLeetCodeUser,
    getLeetCodeSubmissions
  );
  const codechefPlatform = usePlatform<CodeChefUser, CodeChefSubmission>(
    getCodeChefUser,
    getCodeChefSubmissions
  );

  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Professional color palette
  const COLORS = ['#3b82f6', '#b4ff12', '#8b5cf6', '#a855f7'];
  
  // Platform colors
  const platformColors = {
    Codeforces: "#3b82f6",
    LeetCode: "#b4ff12",
    CodeChef: "#8b5cf6"
  };

  const chartConfig = {
    codeforcesSubmissions: {
      label: "Codeforces",
      icon: Icons.file,
      color: platformColors.Codeforces,
    },
    leetcodeSubmissions: {
      label: "LeetCode",
      icon: Icons.file,
      color: platformColors.LeetCode,
    },
    codechefSubmissions: {
      label: "CodeChef",
      icon: Icons.file,
      color: platformColors.CodeChef,
    },
  };

  const allSubmissions = [
    ...codeforcesPlatform.submissions.map(s => ({ ...s, platform: 'Codeforces', status: s.verdict ?? 'OK' })),
    ...leetcodePlatform.submissions.map(s => ({ ...s, platform: 'LeetCode', status: s.statusDisplay ?? 'Accepted' })),
    ...codechefPlatform.submissions.map(s => ({ ...s, platform: 'CodeChef', status: s.result ?? 'Accepted' })),
  ];

  const statusMapping: { [key: string]: string } = {
    OK: 'OK',
    ACCEPTED: 'Accepted',
    WRONG_ANSWER: 'Wrong Answer',
    TLE: 'Time Limit Exceeded',
    'Compilation Error': 'Compilation Error',
    'Runtime Error': 'Runtime Error',
    Accepted: 'Accepted'
  };

  const getStatusBadgeColor = (status: string): string => {
    const normalizedStatus = statusMapping[status] || status;
    switch(normalizedStatus) {
      case 'OK':
      case 'Accepted':
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
      case 'Wrong Answer':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'Time Limit Exceeded':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      case 'Compilation Error':
      case 'Runtime Error':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const filteredSubmissions = submissionStatusFilter
    ? allSubmissions.filter(submission => {
      const normalizedStatus = statusMapping[submission.status] || submission.status;
      return normalizedStatus === submissionStatusFilter
    })
    : allSubmissions;

  const filteredCodeforcesSubmissions = submissionStatusFilter
    ? codeforcesPlatform.submissions.filter(submission => {
      const normalizedStatus = statusMapping[submission.status] || submission.status;
      return normalizedStatus === submissionStatusFilter;
    }).length
    : codeforcesPlatform.submissions.length;

  const filteredLeetcodeSubmissions = submissionStatusFilter
    ? leetcodePlatform.submissions.filter(submission => {
      const normalizedStatus = statusMapping[submission.status] || submission.status;
      return normalizedStatus === submissionStatusFilter
    }).length
    : leetcodePlatform.submissions.length;

  const filteredCodechefSubmissions = submissionStatusFilter
    ? codechefPlatform.submissions.filter(submission => {
      const normalizedStatus = statusMapping[submission.status] || submission.status;
      return normalizedStatus === submissionStatusFilter
    }).length
    : codechefPlatform.submissions.length;

  const submissionsByStatus = filteredSubmissions.reduce((acc: {[key: string]: number}, submission) => {
    const status = submission.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.keys(submissionsByStatus).map(status => ({
    name: status,
    value: submissionsByStatus[status]
  }));

  const submissionsByPlatform = {
    Codeforces: filteredCodeforcesSubmissions,
    LeetCode: filteredLeetcodeSubmissions,
    CodeChef: filteredCodechefSubmissions,
  };

  const platformData = Object.keys(submissionsByPlatform).map(platform => ({
    name: platform,
    value: submissionsByPlatform[platform]
  }));

  const data = [
    {
      name: "Submissions",
      codeforcesSubmissions: filteredCodeforcesSubmissions,
      leetcodeSubmissions: filteredLeetcodeSubmissions,
      codechefSubmissions: filteredCodechefSubmissions,
    },
  ];

  // Difficulty distribution for Codeforces
  const codeforcesDifficultyData = codeforcesPlatform.submissions.reduce((acc: { [key: string]: number }, submission) => {
    // Assuming there's a way to determine difficulty, replace with actual logic
    const difficulty = '800'; // Replace with actual difficulty from submission or problem
    acc[difficulty] = (acc[difficulty] || 0) + 1;
    return acc;
  }, {});

  const difficultyData = Object.keys(codeforcesDifficultyData).map(difficulty => ({
    name: difficulty,
    value: codeforcesDifficultyData[difficulty]
  }));

  // Language distribution for Codeforces
  const codeforcesLanguageData = codeforcesPlatform.submissions.reduce((acc: { [key: string]: number }, submission) => {
    // Assuming there's a way to determine language, replace with actual logic
    const language = 'cpp'; // Replace with actual language from submission
    acc[language] = (acc[language] || 0) + 1;
    return acc;
  }, {});

  const languageData = Object.keys(codeforcesLanguageData).map(language => ({
    name: language,
    value: codeforcesLanguageData[language]
  }));

  // Handle fetch with loading state
  const handleFetch = async (platform: string, handle: string) => {
    setIsLoading(true);
    try {
      if (platform === 'Codeforces') {
        await codeforcesPlatform.fetchUser(handle);
      } else if (platform === 'LeetCode') {
        await leetcodePlatform.fetchUser(handle);
      } else if (platform === 'CodeChef') {
        await codechefPlatform.fetchUser(handle);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hasAnyData = filteredSubmissions.length > 0 || 
                     codeforcesPlatform.user !== null || 
                     leetcodePlatform.user !== null || 
                     codechefPlatform.user !== null;

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto py-6">
          <div className="flex items-center space-x-4">
            <Trophy className="h-8 w-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">CP Analytics Dashboard</h1>
              <p className="text-slate-500 text-sm">Track your competitive programming performance across platforms</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-8">
        {/* Platform Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PlatformCard
              title="Codeforces"
              icon={<div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold">CF</span>
              </div>}
              handle={codeforcesPlatform.handle}
              setHandle={codeforcesPlatform.setHandle}
              user={codeforcesPlatform.user}
              onSubmit={() => handleFetch('Codeforces', codeforcesPlatform.handle)}
              color="border-blue-500"
              accentColor="blue"
              isLoading={isLoading}
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <PlatformCard
              title="LeetCode"
              icon={<div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-bold">LC</span>
              </div>}
              handle={leetcodePlatform.handle}
              setHandle={leetcodePlatform.setHandle}
              user={leetcodePlatform.user}
              onSubmit={() => handleFetch('LeetCode', leetcodePlatform.handle)}
              color="border-indigo-500"
              accentColor="indigo"
              isLoading={isLoading}
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <PlatformCard
              title="CodeChef"
              icon={<div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-bold">CC</span>
              </div>}
              handle={codechefPlatform.handle}
              setHandle={codechefPlatform.setHandle}
              user={codechefPlatform.user}
              onSubmit={() => handleFetch('CodeChef', codechefPlatform.handle)}
              color="border-purple-500"
              accentColor="purple"
              isLoading={isLoading}
            />
          </motion.div>
        </div>

        {hasAnyData ? (
          <>
            {/* Analytics Overview */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                Analytics Overview
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="shadow-sm bg-white border-0">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <BarChart2 className="h-5 w-5 text-indigo-600" />
                          <CardTitle className="text-slate-800">Submissions Overview</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                          <YAxis tick={{ fill: '#6b7280' }} />
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '8px', 
                              border: 'none', 
                              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                              backgroundColor: '#fff'
                            }} 
                          />
                          <Legend />
                          <Bar 
                            dataKey="codeforcesSubmissions" 
                            name={chartConfig.codeforcesSubmissions.label} 
                            fill={chartConfig.codeforcesSubmissions.color} 
                            radius={[4, 4, 0, 0]} 
                          />
                          <Bar 
                            dataKey="leetcodeSubmissions" 
                            name={chartConfig.leetcodeSubmissions.label} 
                            fill={chartConfig.leetcodeSubmissions.color} 
                            radius={[4, 4, 0, 0]} 
                          />
                          <Bar 
                            dataKey="codechefSubmissions" 
                            name={chartConfig.codechefSubmissions.label} 
                            fill={chartConfig.codechefSubmissions.color} 
                            radius={[4, 4, 0, 0]} 
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Card className="shadow-sm bg-white border-0">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <PieChartIcon className="h-5 w-5 text-indigo-600" />
                          <CardTitle className="text-slate-800">Platform Distribution</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={platformData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            label
                          >
                            {
                              platformData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={COLORS[index % COLORS.length]} 
                                />
                              ))
                            }
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              borderRadius: '8px', 
                              border: 'none', 
                              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                              backgroundColor: '#fff'
                            }} 
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>

            {/* Performance Analysis */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                <Code2 className="h-5 w-5 mr-2 text-indigo-600" />
                Performance Analysis
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {codeforcesPlatform.ratingHistory.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="shadow-sm bg-white border-0">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <LineChartIcon className="h-5 w-5 text-indigo-600"/>
                            <CardTitle className="text-slate-800">Codeforces Rating Progression</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ResponsiveContainer width="100%" height={300}>
                          <ComposedChart data={codeforcesPlatform.ratingHistory}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                            <XAxis
                              dataKey="timestamp"
                              tickFormatter={(timestamp) => new Date(timestamp * 1000).toLocaleDateString()}
                              tick={{fill: '#6b7280'}}
                            />
                            <YAxis tick={{fill: '#6b7280'}}/>
                            <Tooltip
                              labelFormatter={(timestamp) => new Date(timestamp * 1000).toLocaleDateString()}
                              contentStyle={{
                                borderRadius: '8px', 
                                border: 'none', 
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                backgroundColor: '#fff'
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="rating"
                              stroke="#3b82f6"
                              strokeWidth={2}
                              dot={{fill: '#3b82f6', strokeWidth: 2}}
                              activeDot={{r: 6, fill: '#3b82f6'}}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Card className="shadow-sm bg-white border-0">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <BarChart2 className="h-5 w-5 text-indigo-600"/>
                          <CardTitle className="text-slate-800">Status Distribution</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={statusData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                          <XAxis dataKey="name" tick={{fill: '#6b7280'}}/>
                          <YAxis tick={{fill: '#6b7280'}}/>
                          <Tooltip
                            contentStyle={{
                              borderRadius: '8px', 
                              border: 'none', 
                              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                              backgroundColor: '#fff'
                            }}
                          />
                          <Bar 
                            dataKey="value" 
                            name="Submissions" 
                            fill="#6366f1" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>

            {/* Additional Analysis */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                <BarChart2 className="h-5 w-5 mr-2 text-indigo-600" />
                Detailed Analytics
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="shadow-sm bg-white border-0">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <BarChart2 className="h-5 w-5 text-indigo-600"/>
                          <CardTitle className="text-slate-800">Problem Difficulty Distribution</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={difficultyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                          <XAxis dataKey="name" tick={{fill: '#6b7280'}}/>
                          <YAxis tick={{fill: '#6b7280'}}/>
                          <Tooltip
                            contentStyle={{
                              borderRadius: '8px', 
                              border: 'none', 
                              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                              backgroundColor: '#fff'
                            }}
                          />
                          <Bar 
                            dataKey="value" 
                            name="Difficulty" 
                            fill="#8b5cf6" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Card className="shadow-sm bg-white border-0">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <PieChartIcon className="h-5 w-5 text-indigo-600"/>
                          <CardTitle className="text-slate-800">Language Distribution</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={languageData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            label
                          >
                            {
                              languageData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))
                            }
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              borderRadius: '8px', 
                              border: 'none', 
                              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                              backgroundColor: '#fff'
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>

            {/* Recent Submissions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-sm bg-white border-0 mb-8">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileCode className="h-5 w-5 text-indigo-600" />
                      <CardTitle className="text-slate-800">Recent Submissions</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-slate-400" />
                      <Select onValueChange={(value) => setSubmissionStatusFilter(value === "" ? null : value)}>
                        <SelectTrigger className="w-[180px] border-slate-200 bg-white">
                          <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={""}>All Statuses</SelectItem>
                          <SelectItem value={"OK"}>OK</SelectItem>
                          <SelectItem value={"Accepted"}>Accepted</SelectItem>
                          <SelectItem value={"Wrong Answer"}>Wrong Answer</SelectItem>
                          <SelectItem value={"Time Limit Exceeded"}>Time Limit Exceeded</SelectItem>
                          <SelectItem value={"Compilation Error"}>Compilation Error</SelectItem>
                          <SelectItem value={"Runtime Error"}>Runtime Error</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader className="bg-slate-50 sticky top-0 z-10">
                        <TableRow>
                          <TableHead className="w-[150px] font-medium text-slate-700">Platform</TableHead>
                          <TableHead className="font-medium text-slate-700">Problem</TableHead>
                          <TableHead className="w-[150px] font-medium text-slate-700">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSubmissions.length > 0 ? (
                          filteredSubmissions.map((submission: any, index: number) => (
                            <TableRow key={index} className="hover:bg-slate-50 transition-colors">
                              <TableCell className="font-medium">
                                <div className="flex items-center space-x-2">
                                  {submission.platform === 'Codeforces' && (
                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                      <span className="text-blue-600 text-xs font-bold">CF</span>
                                    </div>
                                  )}
                                  {submission.platform === 'LeetCode' && (
                                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                                      <span className="text-indigo-600 text-xs font-bold">LC</span>
                                    </div>
                                  )}
                                  {submission.platform === 'CodeChef' && (
                                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                                      <span className="text-purple-600 text-xs font-bold">CC</span>
                                    </div>
                                  )}
                                  <span>{submission.platform}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium text-slate-700">
                                  {submission.problemName || submission.problemTitle || submission.problemCode}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge className={`font-medium ${getStatusBadgeColor(submission.status)}`}>
                                  {submission.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="h-64">
                              <div className="flex flex-col items-center justify-center text-center py-8">
                                <AlertCircle className="h-12 w-12 text-slate-300 mb-3" />
                                <p className="text-slate-500 font-medium mb-1">No submissions found</p>
                                <p className="text-slate-400 text-sm max-w-md">
                                  {submissionStatusFilter ? 
                                    'Try changing your filter or fetch data from more platforms.' : 
                                    'Enter your username for any platform and click "Fetch" to load your submissions.'}
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-16 text-center">
            <div className="max-w-md mx-auto">
              <Trophy className="h-16 w-16 text-indigo-200 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to CP Analytics</h2>
              <p className="text-slate-500 mb-6">
                Enter your username for any competitive programming platform above and click "Fetch" to start tracking your progress.
              </p>
              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-600 text-xs font-bold">CF</span>
                  </div>
                  <p className="text-blue-600 font-medium text-sm">Codeforces</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-2">
                    <span className="text-indigo-600 text-xs font-bold">LC</span>
                  </div>
                  <p className="text-indigo-600 font-medium text-sm">LeetCode</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2">
                    <span className="text-purple-600 text-xs font-bold">CC</span>
                  </div>
                  <p className="text-purple-600 font-medium text-sm">CodeChef</p>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                Track your performance, analyze your submissions, and improve your competitive programming skills.
              </p>
            </div>
          </div>
        )}
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="container mx-auto">
          <p className="text-slate-500 text-sm text-center">
            CP Analytics Dashboard © {new Date().getFullYear()} | Track your competitive programming journey
          </p>
        </div>
      </footer>
    </div>
  );
};

interface PlatformCardProps<User> {
  title: string;
  icon?: React.ReactNode;
  handle: string;
  setHandle: React.Dispatch<React.SetStateAction<string>>;
  user: User | null;
  onSubmit: () => void;
  color?: string;
  accentColor?: string;
  isLoading?: boolean;
}

const PlatformCard = <User extends { username?: string; handle?: string; problemsSolved?: number; rating?: number }>({
  title,
  icon,
  handle,
  setHandle,
  user,
  onSubmit,
  color,
  accentColor = "indigo",
  isLoading = false,
}: PlatformCardProps<User>) => {
  
  const accentMap = {
    blue: {
      bg: "bg-blue-600",
      hover: "hover:bg-blue-700",
      focus: "focus:ring-blue-500",
      text: "text-blue-600",
      bgLight: "bg-blue-50",
      bgMedium: "bg-blue-100",
    },
    indigo: {
      bg: "bg-indigo-600",
      hover: "hover:bg-indigo-700",
      focus: "focus:ring-indigo-500",
      text: "text-indigo-600",
      bgLight: "bg-indigo-50",
      bgMedium: "bg-indigo-100",
    },
    purple: {
      bg: "bg-purple-600",
      hover: "hover:bg-purple-700",
      focus: "focus:ring-purple-500",
      text: "text-purple-600",
      bgLight: "bg-purple-50",
      bgMedium: "bg-purple-100",
    }
  };
  
  const buttonStyles = `${accentMap[accentColor].bg} ${accentMap[accentColor].hover} focus:ring-2 focus:ring-offset-2 ${accentMap[accentColor].focus}`;
  
  return (
    <Card className={`shadow-sm bg-white overflow-hidden border-0 ${color ? `border-t-4 ${color}` : ''} transition-all hover:shadow-md`}>
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          {icon}
          <div>
            <CardTitle className="text-slate-800">{title}</CardTitle>
            <CardDescription className="text-slate-500 text-sm">
              Enter your {title} handle
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor={`${title.toLowerCase()}-handle`} className="text-sm font-medium text-slate-700">
              Username
            </Label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id={`${title.toLowerCase()}-handle`}
                  type="text"
                  placeholder={`${title} username`}
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="pl-9 bg-white border-slate-200 focus:border-slate-300 focus:ring focus:ring-slate-200 focus:ring-opacity-50"
                />
              </div>
              <Button 
                onClick={onSubmit}
                disabled={isLoading || !handle.trim()}
                className={`${buttonStyles} transition-colors`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading</span>
                  </div>
                ) : "Fetch"}
              </Button>
            </div>
          </div>
          
          {title === "LeetCode" && user === null && handle !== "" ? (
            <div className={`${accentMap[accentColor].bgLight} rounded-lg p-4 space-y-2 border border-slate-200`}>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold text-slate-800">Profile Information</h3>
              </div>
              <Separator className="bg-slate-200" />
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Profile not found</span>
                </div>
              </div>
            </div>
          ) : (user && (
            <div className={`${accentMap[accentColor].bgLight} rounded-lg p-4 space-y-2 border border-slate-200`}>
              <div className="flex items-center space-x-2">
                <User className={`h-5 w-5 ${accentMap[accentColor].text}`} />
                <h3 className="font-semibold text-slate-800">Profile Information</h3>
              </div>
              <Separator className="bg-slate-200" />
              <div className="space-y-2 pt-1">
                {user.username && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Username:</span>
                    <span className="text-sm font-medium text-slate-700 bg-white px-2 py-0.5 rounded">{user.username}</span>
                  </div>
                )}
                {user.handle && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Handle:</span>
                    <span className="text-sm font-medium text-slate-700 bg-white px-2 py-0.5 rounded">{user.handle}</span>
                  </div>
                )}
                {user.problemsSolved && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Problems Solved:</span>
                    <span className="text-sm font-medium text-slate-700 bg-white px-2 py-0.5 rounded">{user.problemsSolved}</span>
                  </div>
                )}
                {user.rating && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Rating:</span>
                    <span className="text-sm font-medium text-slate-700 bg-white px-2 py-0.5 rounded">{user.rating}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;