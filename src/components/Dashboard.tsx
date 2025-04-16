"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getCodeforcesUser, getCodeforcesSubmissions } from "@/services/codeforces";
import { getLeetCodeUser, getLeetCodeSubmissions } from "@/services/leetcode";
import { getCodeChefUser, getCodeChefSubmissions } from "@/services/codechef";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
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
import { ChartContainer } from "@/components/ui/chart";

interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = ({}) => {
  const [codeforcesHandle, setCodeforcesHandle] = useState<string>("");
  const [leetcodeUsername, setLeetcodeUsername] = useState<string>("");
  const [codechefUsername, setCodechefUsername] = useState<string>("");

  const [codeforcesUser, setCodeforcesUser] = useState<CodeforcesUser | null>(null);
  const [leetcodeUser, setLeetcodeUser] = useState<LeetCodeUser | null>(null);
  const [codechefUser, setCodechefUser] = useState<CodeChefUser | null>(null);

  const [codeforcesSubmissions, setCodeforcesSubmissions] = useState<CodeforcesSubmission[]>([]);
  const [leetcodeSubmissions, setLeetcodeSubmissions] = useState<LeetCodeSubmission[]>([]);
  const [codechefSubmissions, setCodechefSubmissions] = useState<CodeChefSubmission[]>([]);

  useEffect(() => {
    // You can load default usernames from local storage or environment variables here
  }, []);

  const handleCodeforcesSubmit = async () => {
    if (codeforcesHandle) {
      const user = await getCodeforcesUser(codeforcesHandle);
      const submissions = await getCodeforcesSubmissions(codeforcesHandle, 5);
      setCodeforcesUser(user);
      setCodeforcesSubmissions(submissions);
    }
  };

  const handleLeetcodeSubmit = async () => {
    if (leetcodeUsername) {
      const user = await getLeetCodeUser(leetcodeUsername);
      const submissions = await getLeetCodeSubmissions(leetcodeUsername, 5);
      setLeetcodeUser(user);
      setLeetcodeSubmissions(submissions);
    }
  };

  const handleCodechefSubmit = async () => {
    if (codechefUsername) {
      const user = await getCodeChefUser(codechefUsername);
      const submissions = await getCodeChefSubmissions(codechefUsername, 5);
      setCodechefUser(user);
      setCodechefSubmissions(submissions);
    }
  };

  const chartConfig = {
    codeforcesSubmissions: {
      label: "Codeforces Submissions",
      icon: Icons.file,
    },
    leetcodeSubmissions: {
      label: "LeetCode Submissions",
      icon: Icons.file,
    },
    codechefSubmissions: {
      label: "CodeChef Submissions",
      icon: Icons.file,
    },
  };

  const data = [
    {
      name: "Group A",
      codeforcesSubmissions: codeforcesSubmissions.length,
      leetcodeSubmissions: leetcodeSubmissions.length,
      codechefSubmissions: codechefSubmissions.length,
    },
  ];

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Codeforces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                type="text"
                placeholder="Codeforces Handle"
                value={codeforcesHandle}
                onChange={(e) => setCodeforcesHandle(e.target.value)}
              />
              <Button onClick={handleCodeforcesSubmit}>Fetch</Button>
            </div>
            {codeforcesUser && (
              <div className="mt-4">
                <p>Handle: {codeforcesUser.handle}</p>
                <p>Rating: {codeforcesUser.rating}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LeetCode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                type="text"
                placeholder="LeetCode Username"
                value={leetcodeUsername}
                onChange={(e) => setLeetcodeUsername(e.target.value)}
              />
              <Button onClick={handleLeetcodeSubmit}>Fetch</Button>
            </div>
            {leetcodeUser && (
              <div className="mt-4">
                <p>Username: {leetcodeUser.username}</p>
                <p>Problems Solved: {leetcodeUser.problemsSolved}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CodeChef</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                type="text"
                placeholder="CodeChef Username"
                value={codechefUsername}
                onChange={(e) => setCodechefUsername(e.target.value)}
              />
              <Button onClick={handleCodechefSubmit}>Fetch</Button>
            </div>
            {codechefUser && (
              <div className="mt-4">
                <p>Username: {codechefUser.username}</p>
                <p>Rating: {codechefUser.rating}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submissions Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} id="submission-chart">
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardContent>
            <ScrollArea>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Platform</TableHead>
                    <TableHead>Problem</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codeforcesSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>Codeforces</TableCell>
                      <TableCell>{submission.problemName}</TableCell>
                      <TableCell>{submission.status}</TableCell>
                    </TableRow>
                  ))}
                  {leetcodeSubmissions.map((submission) => (
                    <TableRow key={submission.timestamp}>
                      <TableCell>LeetCode</TableCell>
                      <TableCell>{submission.problemTitle}</TableCell>
                      <TableCell>{submission.status}</TableCell>
                    </TableRow>
                  ))}
                  {codechefSubmissions.map((submission) => (
                    <TableRow key={submission.submissionDate}>
                      <TableCell>CodeChef</TableCell>
                      <TableCell>{submission.problemCode}</TableCell>
                      <TableCell>{submission.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
};

export default Dashboard;
