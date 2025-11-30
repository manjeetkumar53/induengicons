'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfitLossReport } from '@/components/reports/ProfitLossReport'
import { CashFlowReport } from '@/components/reports/CashFlowReport'
import { IncomeSourceReport } from '@/components/reports/IncomeSourceReport'
import { ExpenseCategoryReport } from '@/components/reports/ExpenseCategoryReport'
import { TransactionSummary } from '@/components/reports/TransactionSummary'
import { BarChart3, TrendingUp, PieChart, Wallet, Activity, Sparkles } from 'lucide-react'
import { AIChatInterface } from '@/components/ai/AIChatInterface'

export default function ReportsDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Financial Reports</h2>
                <p className="text-muted-foreground">
                    Comprehensive analysis of your financial data.
                </p>
            </div>

            <Tabs defaultValue="profit-loss" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
                    <TabsTrigger value="profit-loss" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="hidden sm:inline">Profit & Loss</span>
                        <span className="sm:hidden">P&L</span>
                    </TabsTrigger>
                    <TabsTrigger value="cash-flow" className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        <span className="hidden sm:inline">Cash Flow</span>
                        <span className="sm:hidden">Cash</span>
                    </TabsTrigger>
                    <TabsTrigger value="income" className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        <span className="hidden sm:inline">Income</span>
                        <span className="sm:hidden">Inc</span>
                    </TabsTrigger>
                    <TabsTrigger value="expenses" className="flex items-center gap-2">
                        <PieChart className="h-4 w-4" />
                        <span className="hidden sm:inline">Expenses</span>
                        <span className="sm:hidden">Exp</span>
                    </TabsTrigger>
                    <TabsTrigger value="summary" className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        <span className="hidden sm:inline">Summary</span>
                        <span className="sm:hidden">Sum</span>
                    </TabsTrigger>
                    <TabsTrigger value="ai-chat" className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        <span className="hidden sm:inline">AI Assistant</span>
                        <span className="sm:hidden">AI</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profit-loss" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profit & Loss Statement</CardTitle>
                            <CardDescription>
                                View your income, expenses, and net profit over time.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProfitLossReport />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="cash-flow" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cash Flow Analysis</CardTitle>
                            <CardDescription>
                                Track money coming in and going out of your business.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CashFlowReport />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="income" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Income Analysis</CardTitle>
                            <CardDescription>
                                Breakdown of your revenue sources.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <IncomeSourceReport />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="expenses" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Expense Analysis</CardTitle>
                            <CardDescription>
                                Breakdown of your spending by category.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ExpenseCategoryReport />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="summary" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction Summary</CardTitle>
                            <CardDescription>
                                Real-time overview of your transaction activity.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TransactionSummary />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
