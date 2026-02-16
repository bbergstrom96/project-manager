--
-- PostgreSQL database dump
--

\restrict mbRYJqyBQFwya7Hx87kf29P18nRgmp4INmIjTzl2L7daU0L7LWH3U8aBfaLvIZ8

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Area; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Area" (id, name, icon, color, "order", "createdAt", "updatedAt") FROM stdin;
cmlihexi30004u1rwdbz2594h	Professional	💼	#3b82f6	1	2026-02-11 20:28:00.411	2026-02-11 21:36:50.092
cmlhgx35j0000zcv98z2utvv4	Personal	🏠	#10b981	0	2026-02-11 03:26:21.752	2026-02-11 21:36:55.778
cmlikadg2000b9l2kd5sotl90	Creative	✨	#f97316	2	2026-02-11 21:48:26.642	2026-02-11 21:48:26.642
cmlimevbs00149l2kzcs0cx71	Social	🎉	#dc2626	3	2026-02-11 22:47:55.672	2026-02-11 22:47:55.672
\.


--
-- Data for Name: AreaGoal; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AreaGoal" (id, "areaId", period, content, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Label; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Label" (id, name, color, "isFavorite", "order", "createdAt", "updatedAt") FROM stdin;
cmlhehck80000o3ualqor3jpb	work	#ff6b6b	f	0	2026-02-11 02:18:08.216	2026-02-11 02:18:08.216
cmlhehckg0001o3uabjjfednh	personal	#4ecdc4	f	1	2026-02-11 02:18:08.225	2026-02-11 02:18:08.225
cmlhehcki0002o3uacsvtzlra	urgent	#ffd93d	f	2	2026-02-11 02:18:08.226	2026-02-11 02:18:08.226
\.


--
-- Data for Name: PlanningNote; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PlanningNote" (id, title, content, quarter, "order", "createdAt", "updatedAt") FROM stdin;
cmlk185re0000apmoegvls66e	Project 30	<p><strong>Overall theme: Finish BUILDING so you can start DOING</strong></p><p></p><h3>Professional</h3><p></p><p></p>	2026-Q1	0	2026-02-12 22:30:23.018	2026-02-15 19:16:32.659
cmlk1k7vw0001apmorfh74jbs	New Note		2026-Q1	1	2026-02-12 22:39:45.644	2026-02-15 21:21:36.814
\.


--
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Project" (id, name, color, "isFavorite", "isArchived", "order", "createdAt", "updatedAt", description, "endWeek", "startWeek", "areaId") FROM stdin;
cmlhehckx0007o3uaeqqjobze	Personal	#10b981	f	f	1	2026-02-11 02:18:08.242	2026-02-11 02:18:08.242	\N	\N	\N	\N
cmlhehckz0008o3ua7jjjalu5	Shopping List	#f59e0b	f	f	2	2026-02-11 02:18:08.244	2026-02-11 02:18:08.244	\N	\N	\N	\N
cmlihmf6x00019l2kyn9z3mgf	NYGA Tests	#3b82f6	f	f	0	2026-02-11 20:33:49.928	2026-02-14 01:09:39.078	<p>Labcorp locations that are covered:</p><ul><li><p>111 3rd Ave Apt, New York, NY 10003</p></li></ul><p></p>	2.3	2.2	cmlhgx35j0000zcv98z2utvv4
cmlikanfy000d9l2kswmso4z3	Recording Setup	#3b82f6	f	f	1	2026-02-11 21:48:39.598	2026-02-14 17:03:28.809	\N	2.4	2.3	cmlikadg2000b9l2kd5sotl90
cmlimuab5001k9l2k2hht0xml	Home Improvement	#808080	f	f	1	2026-02-11 22:59:54.929	2026-02-12 20:12:41.52	\N	\N	\N	cmlhgx35j0000zcv98z2utvv4
cmliuee7u00339l2kqe12zt5n	Proj Mgmt App	#808080	f	f	0	2026-02-12 02:31:30.425	2026-02-15 21:22:13.088	<p>p986897t78i</p>	2.3	2.2	cmlihexi30004u1rwdbz2594h
cmlhehckk0003o3uam4z0076z	Work	#3b82f6	f	f	0	2026-02-11 02:18:08.228	2026-02-11 03:02:28.074	\N	\N	\N	\N
cmlhg47yr00004prhrziux17n	Test	#3b82f6	f	f	4	2026-02-11 03:03:54.963	2026-02-11 03:03:54.963	\N	\N	\N	\N
cmlih8jp90000u1rwh1y2tlf0	test project	#3b82f6	f	f	5	2026-02-11 20:23:02.589	2026-02-11 20:23:02.589	\N	\N	\N	\N
cmlih8rw70001u1rwmc8t1m88	bla	#3b82f6	f	f	6	2026-02-11 20:23:13.207	2026-02-11 20:23:13.207	\N	\N	\N	\N
cmlihe4ch0002u1rw60kdfhjr	test	#3b82f6	f	f	7	2026-02-11 20:27:22.625	2026-02-11 20:27:22.625	\N	\N	\N	\N
cmlihear90003u1rwqmq5nxmu	bla	#3b82f6	f	f	8	2026-02-11 20:27:30.934	2026-02-11 20:27:30.934	\N	\N	\N	\N
cmlihfb200005u1rw9c9o8h33	test	#3b82f6	f	f	9	2026-02-11 20:28:17.977	2026-02-11 20:28:17.977	\N	\N	\N	\N
cmlhemfc10001tak4b34z8s3b	Test Project	#3b82f6	f	f	3	2026-02-11 02:22:05.089	2026-02-12 18:09:44.622	\N	2.1	2.1	\N
cmlihmjcq00039l2khxh4t3ph	Setup Finances	#3b82f6	f	f	2	2026-02-11 20:33:55.322	2026-02-13 19:00:46.499	\N	\N	\N	cmlhgx35j0000zcv98z2utvv4
cmlikcnrz000f9l2k2jevdcu2	New Room Setup	#3b82f6	f	f	2	2026-02-11 21:50:13.343	2026-02-12 21:09:24.263	\N	\N	\N	cmlikadg2000b9l2kd5sotl90
cmliuj3z4003j9l2kbu4r3hju	Setup Anchors	#808080	f	f	14	2026-02-12 02:35:10.433	2026-02-12 21:09:26.464	\N	\N	\N	cmlimevbs00149l2kzcs0cx71
cmliuix43003h9l2k1wiv7d4k	March Dinner Party	#808080	f	f	13	2026-02-12 02:35:01.539	2026-02-12 19:26:57.118	\N	\N	\N	cmlimevbs00149l2kzcs0cx71
cmliueu0000379l2kt0gs50cw	Health Tracker App	#808080	f	f	1	2026-02-12 02:31:50.88	2026-02-13 19:27:23.302	\N	3.1	2.4	cmlihexi30004u1rwdbz2594h
cmliuej0h00359l2kxnm2odph	Long Covid App	#808080	f	f	2	2026-02-12 02:31:36.641	2026-02-13 19:27:23.302	\N	3.2	3.2	cmlihexi30004u1rwdbz2594h
cmll8s07e0003apmoryl1l7vp	Portfolio Website	#808080	f	f	3	2026-02-13 18:49:32.426	2026-02-13 19:27:23.302	\N	3.4	3.3	cmlihexi30004u1rwdbz2594h
cmlikdmjk000h9l2k9i2jr1q7	Audition Prep	#808080	f	f	3	2026-02-11 21:50:58.4	2026-02-12 23:16:10.258	\N	\N	\N	cmlikadg2000b9l2kd5sotl90
\.


--
-- Data for Name: Routine; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Routine" (id, name, description, icon, color, "order", "isArchived", variant, "createdAt", "updatedAt") FROM stdin;
cmllf9rg10007d6gi6jj570zp	Morning Routine	\N	\N	#808080	0	f	\N	2026-02-13 21:51:18.578	2026-02-13 21:51:18.578
cmllg5xq5000ud6git61bxxyf	Lunch Routine	\N	\N	#808080	1	f	\N	2026-02-13 22:16:19.708	2026-02-13 22:16:19.708
cmlljbdu2002q13birx7kru7u	Evening Routine	\N	\N	#808080	2	f	\N	2026-02-13 23:44:32.713	2026-02-13 23:44:32.713
cmlljvz5s004b13biu5jodc0w	Night Routine	\N	\N	#808080	3	f	\N	2026-02-14 00:00:33.472	2026-02-14 00:00:33.472
\.


--
-- Data for Name: RoutineSection; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RoutineSection" (id, name, "order", "routineId", "createdAt", "updatedAt") FROM stdin;
cmllgbqlc00015p5k9emkx3hc		0	cmllg5xq5000ud6git61bxxyf	2026-02-13 22:20:50.4	2026-02-13 22:20:50.4
cmllgbthi00055p5kv4t21xyq		2	cmllf9rg10007d6gi6jj570zp	2026-02-13 22:20:54.151	2026-02-13 22:20:54.151
cmllfgak3000hd6gihtesgeaa	Get Up And Get Out	1	cmllf9rg10007d6gi6jj570zp	2026-02-13 21:56:23.284	2026-02-13 22:36:44.862
cmllgxzoy000z5p5k58a3aab3	Morning Workout	3	cmllf9rg10007d6gi6jj570zp	2026-02-13 22:38:08.626	2026-02-13 22:38:08.626
cmllh2cqu000b13bir2kuz9wx	Breakfast + Plan Out Day	4	cmllf9rg10007d6gi6jj570zp	2026-02-13 22:41:32.167	2026-02-13 22:41:32.167
cmlliytt3002313bikndnpkfa	Miscellaneous	5	cmllf9rg10007d6gi6jj570zp	2026-02-13 23:34:46.887	2026-02-13 23:34:46.887
cmllj6upc002d13biaf39sasv	Get Ready for Day	6	cmllf9rg10007d6gi6jj570zp	2026-02-13 23:41:01.297	2026-02-13 23:41:01.297
cmlljbk2g002s13bip5ya8o8q	End-Of-Day	0	cmlljbdu2002q13birx7kru7u	2026-02-13 23:44:40.792	2026-02-13 23:44:40.792
cmlljcakc003413biunu1oktu	Workout	1	cmlljbdu2002q13birx7kru7u	2026-02-13 23:45:15.132	2026-02-13 23:45:15.132
cmlljgqxq003g13bij00xns0l	Clean Up	2	cmlljbdu2002q13birx7kru7u	2026-02-13 23:48:42.974	2026-02-13 23:48:42.974
cmlljiuuz003s13bi6ky9qm3y	Dinner	3	cmlljbdu2002q13birx7kru7u	2026-02-13 23:50:21.372	2026-02-13 23:50:21.372
cmlljj6kn004013bi5n847b2j	Finish Up	4	cmlljbdu2002q13birx7kru7u	2026-02-13 23:50:36.551	2026-02-13 23:50:36.551
cmlljw3r0004d13biffa88qyx	Wrap-Up	0	cmlljvz5s004b13biu5jodc0w	2026-02-14 00:00:39.42	2026-02-14 00:00:39.42
cmllk021j004n13bi3dx715jc	Hygeine	1	cmlljvz5s004b13biu5jodc0w	2026-02-14 00:03:43.832	2026-02-14 00:03:43.832
cmllk0cvx004v13biyxyjwyam	Setup	2	cmlljvz5s004b13biu5jodc0w	2026-02-14 00:03:57.885	2026-02-14 00:03:57.885
cmllk12j0005513bi6mgg9k1d	Wind Down	3	cmlljvz5s004b13biu5jodc0w	2026-02-14 00:04:31.116	2026-02-14 00:04:31.116
\.


--
-- Data for Name: RoutineItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RoutineItem" (id, name, description, "order", "isTrackable", "sectionId", "parentId", "createdAt", "updatedAt") FROM stdin;
cmlliwcl8001p13bipgscr3og	Comms	\N	2	f	cmllh2cqu000b13bir2kuz9wx	\N	2026-02-13 23:32:51.261	2026-02-13 23:32:51.261
cmlliwuue001r13bi4ty6khfg	Personal: Texts & email	\N	0	f	cmllh2cqu000b13bir2kuz9wx	cmlliwcl8001p13bipgscr3og	2026-02-13 23:33:14.918	2026-02-13 23:33:14.918
cmllix0tg001t13bigvxk0vor	Vitalis: Discord	\N	1	f	cmllh2cqu000b13bir2kuz9wx	cmlliwcl8001p13bipgscr3og	2026-02-13 23:33:22.66	2026-02-13 23:33:22.66
cmllix8j2001v13bie7x12k33	GBL: Mouse mover, Email, Teams	\N	2	f	cmllh2cqu000b13bir2kuz9wx	cmlliwcl8001p13bipgscr3og	2026-02-13 23:33:32.654	2026-02-13 23:33:32.654
cmllgbqls00035p5kohj9z8co	Task management + check emails	\N	0	f	cmllgbqlc00015p5k9emkx3hc	\N	2026-02-13 22:20:50.417	2026-02-13 22:36:01.748
cmllgtrlr000b5p5kenupj97d	Finish water 1 + refill bottle	\N	1	f	cmllgbqlc00015p5k9emkx3hc	\N	2026-02-13 22:34:51.52	2026-02-13 22:36:01.748
cmllgutwh000d5p5kiqmw3j5l	Prep food	\N	2	f	cmllgbqlc00015p5k9emkx3hc	\N	2026-02-13 22:35:41.153	2026-02-13 22:36:01.748
cmllguvsi000f5p5kniwbq9z1	Fiction	\N	3	f	cmllgbqlc00015p5k9emkx3hc	\N	2026-02-13 22:35:43.602	2026-02-13 22:36:01.748
cmllixshd001x13bi2cvdaeyh	Task/Project Management (Details TBD)	\N	3	f	cmllh2cqu000b13bir2kuz9wx	\N	2026-02-13 23:33:58.513	2026-02-13 23:33:58.513
cmlliy1h4001z13bi0344ijkj	Calendar: Work, Personal + Social	\N	4	f	cmllh2cqu000b13bir2kuz9wx	\N	2026-02-13 23:34:10.168	2026-02-13 23:34:10.168
cmllgzrrc000113biaelxm723	Start workouts in Apple Watch, Fitbit, Polar Chest Strap	\N	1	f	cmllgxzoy000z5p5k58a3aab3	\N	2026-02-13 22:39:31.656	2026-02-13 22:39:31.656
cmllgzu4c000313bis8cpjk43	Workout	\N	2	f	cmllgxzoy000z5p5k58a3aab3	\N	2026-02-13 22:39:34.716	2026-02-13 22:39:34.716
cmllgydeo00115p5kpymz9u8n	Roof: 5 mins sunlight + warmup	\N	0	f	cmllgxzoy000z5p5k58a3aab3	\N	2026-02-13 22:38:26.401	2026-02-13 22:40:05.553
cmllh03r4000513birgii079a	End workouts in Apple Watch, Fitbit, and Polar Chest Strap	\N	3	f	cmllgxzoy000z5p5k58a3aab3	\N	2026-02-13 22:39:47.2	2026-02-13 22:40:15.219
cmllh1z71000713bi5jeaj30z	Put gym equipment away	\N	4	f	cmllgxzoy000z5p5k58a3aab3	\N	2026-02-13 22:41:14.605	2026-02-13 22:41:14.605
cmllh26bj000913bisw81qkg7	Charge Apple Watch & AirPods case	\N	5	f	cmllgxzoy000z5p5k58a3aab3	\N	2026-02-13 22:41:23.839	2026-02-13 22:41:23.839
cmlliy66o002113bil5lbwcsg	Obsidian: TBD	\N	5	f	cmllh2cqu000b13bir2kuz9wx	\N	2026-02-13 23:34:16.272	2026-02-13 23:34:16.272
cmlliz34o002513bipuzg6x13	Journal: Yesterday active recall	\N	0	f	cmlliytt3002313bikndnpkfa	\N	2026-02-13 23:34:58.968	2026-02-13 23:34:58.968
cmllizhjn002713bi7iu2z9vt	LinkedIn: Process feed, 5 requests	\N	1	f	cmlliytt3002313bikndnpkfa	\N	2026-02-13 23:35:17.651	2026-02-13 23:35:17.651
cmllj5pif002913biyaeos514	Wash dishes	\N	2	f	cmlliytt3002313bikndnpkfa	\N	2026-02-13 23:40:07.911	2026-02-13 23:40:07.911
cmlliw900001n13bijahp0loj	Assess if freezer meal prep needs to be moved to fridge	\N	1	f	cmllh2cqu000b13bir2kuz9wx	\N	2026-02-13 23:32:46.608	2026-02-13 23:40:40.664
cmllj6n9v002b13bi7a1qj0wf	Put retainer back on	\N	3	f	cmlliytt3002313bikndnpkfa	\N	2026-02-13 23:40:51.668	2026-02-13 23:40:51.668
cmllj758k002f13biykpmbhpx	Quick shower: visualize day	\N	0	f	cmllj6upc002d13biaf39sasv	\N	2026-02-13 23:41:14.948	2026-02-13 23:41:14.948
cmllj7apk002h13bi3eup0tlb	Body moisturizer (no face)	\N	1	f	cmllj6upc002d13biaf39sasv	\N	2026-02-13 23:41:22.04	2026-02-13 23:41:22.04
cmllj7jh1002j13biu3vp9j7y	SPF facial moisturizer + deodorant	\N	2	f	cmllj6upc002d13biaf39sasv	\N	2026-02-13 23:41:33.397	2026-02-13 23:41:33.397
cmllj7m9o002l13biv3gml70a	Chapstick	\N	3	f	cmllj6upc002d13biaf39sasv	\N	2026-02-13 23:41:37.018	2026-02-13 23:41:37.018
cmllj7t8i002n13bij9gvz2vt	Remove Apple Watch and AirPods from charger	\N	4	f	cmllj6upc002d13biaf39sasv	\N	2026-02-13 23:41:46.05	2026-02-13 23:41:46.05
cmllj7wqu002p13bixh5cmjw3	Put Oura ring back on	\N	5	f	cmllj6upc002d13biaf39sasv	\N	2026-02-13 23:41:50.598	2026-02-13 23:41:50.598
cmlljbrlp002u13bi0g3wv6ir	Task Management	\N	0	f	cmlljbk2g002s13bip5ya8o8q	\N	2026-02-13 23:44:50.557	2026-02-13 23:44:50.557
cmlljbulf002w13bil63pygi9	Check emails	\N	1	f	cmlljbk2g002s13bip5ya8o8q	\N	2026-02-13 23:44:54.436	2026-02-13 23:44:54.436
cmlljby1p002y13biwhv32sv0	Costpoint	\N	2	f	cmlljbk2g002s13bip5ya8o8q	\N	2026-02-13 23:44:58.91	2026-02-13 23:44:58.91
cmllfgkoz000ld6giaa3smq01	Make Bed	\N	0	f	cmllfgak3000hd6gihtesgeaa	\N	2026-02-13 21:56:36.419	2026-02-13 23:05:01.79
cmllgwc3t000j5p5k6c620edw	Weight Self	\N	1	f	cmllfgak3000hd6gihtesgeaa	\N	2026-02-13 22:36:51.401	2026-02-13 23:05:01.79
cmllgwgi3000l5p5k3ctw1s57	Water + multivitamin	\N	2	f	cmllfgak3000hd6gihtesgeaa	\N	2026-02-13 22:36:57.1	2026-02-13 23:05:01.79
cmllgwo3q000n5p5kkkh00com	Brush teeth + chapstick	\N	3	f	cmllfgak3000hd6gihtesgeaa	\N	2026-02-13 22:37:06.95	2026-02-13 23:05:01.79
cmllgwr9p000p5p5k255lwy6h	Put retainer back on	\N	4	f	cmllfgak3000hd6gihtesgeaa	\N	2026-02-13 22:37:11.053	2026-02-13 23:05:01.79
cmllgwzxm000r5p5koijqn9r0	Take off Oura ring, put on charger	\N	5	f	cmllfgak3000hd6gihtesgeaa	\N	2026-02-13 22:37:22.282	2026-02-13 23:05:01.79
cmllgx2rt000t5p5k7jeksbc9	Setup gym	\N	6	f	cmllfgak3000hd6gihtesgeaa	\N	2026-02-13 22:37:25.962	2026-02-13 23:05:01.79
cmllgx6dm000v5p5kzsgmh3py	Get dressed for warmup + Polar Chest Strap	\N	7	f	cmllfgak3000hd6gihtesgeaa	\N	2026-02-13 22:37:30.634	2026-02-13 23:05:01.79
cmllgx95t000x5p5k0wiwg2h2	Album	\N	8	f	cmllfgak3000hd6gihtesgeaa	\N	2026-02-13 22:37:34.242	2026-02-13 23:05:01.79
cmlligm3p000f13bicmodm0p2	Lunch	\N	0	f	cmllgbqlc00015p5k9emkx3hc	cmllguvsi000f5p5kniwbq9z1	2026-02-13 23:20:37.092	2026-02-13 23:20:37.092
cmlligv2s000h13bi5kwu1xo8	Yoga/flexibility routine	\N	1	f	cmllgbqlc00015p5k9emkx3hc	cmllguvsi000f5p5kniwbq9z1	2026-02-13 23:20:48.724	2026-02-13 23:20:48.724
cmlliv530001j13bi4y84lns2	Clean dishes	\N	4	f	cmllgbqlc00015p5k9emkx3hc	\N	2026-02-13 23:31:54.876	2026-02-13 23:31:54.876
cmllivbuj001l13birqy8a1bf	Put retainer back on	\N	5	f	cmllgbqlc00015p5k9emkx3hc	\N	2026-02-13 23:32:03.643	2026-02-13 23:32:03.643
cmllhwat9000d13bivrk44wyp	Prepare breakfast	\N	0	f	cmllh2cqu000b13bir2kuz9wx	\N	2026-02-13 23:04:49.341	2026-02-13 23:32:33.701
cmlljbzu1003013biu0970xzt	BWAR	\N	3	f	cmlljbk2g002s13bip5ya8o8q	\N	2026-02-13 23:45:01.225	2026-02-13 23:45:03.867
cmlljc4eh003213bib7k6gnmf	Turn off mouse mover	\N	4	f	cmlljbk2g002s13bip5ya8o8q	\N	2026-02-13 23:45:07.145	2026-02-13 23:45:07.145
cmlljfqw5003613bict5dmgga	Take off Oura Ring	\N	0	f	cmlljcakc003413biunu1oktu	\N	2026-02-13 23:47:56.261	2026-02-13 23:47:56.261
cmlljg4cm003813bibuse79ba	Put on Fitbit + Polar Chest Strap	\N	1	f	cmlljcakc003413biunu1oktu	\N	2026-02-13 23:48:13.702	2026-02-13 23:48:13.702
cmlljgdnp003a13bi7c52elot	Take any hallway trash downstairs on way out	\N	2	f	cmlljcakc003413biunu1oktu	\N	2026-02-13 23:48:25.765	2026-02-13 23:48:25.765
cmlljghh5003c13biuh4xaxri	Add workout to Strava	\N	3	f	cmlljcakc003413biunu1oktu	\N	2026-02-13 23:48:30.713	2026-02-13 23:48:30.713
cmlljglse003e13biz86kbuko	Charge Apple Watch	\N	4	f	cmlljcakc003413biunu1oktu	\N	2026-02-13 23:48:36.303	2026-02-13 23:48:36.303
cmlljhprb003i13bi7z88taqz	Full shower + body moisturizer (no face)	\N	0	f	cmlljgqxq003g13bij00xns0l	\N	2026-02-13 23:49:28.103	2026-02-13 23:49:28.103
cmllji0ge003k13bi7ce14nan	Gratefulness	\N	0	f	cmlljgqxq003g13bij00xns0l	cmlljhprb003i13bi7z88taqz	2026-02-13 23:49:41.966	2026-02-13 23:49:41.966
cmllji8ud003m13bio02mdazw	Facial pm moisturizer	\N	1	f	cmlljgqxq003g13bij00xns0l	\N	2026-02-13 23:49:52.837	2026-02-13 23:49:52.837
cmlljibo9003o13biv23jv8vg	Deodorant	\N	2	f	cmlljgqxq003g13bij00xns0l	\N	2026-02-13 23:49:56.506	2026-02-13 23:49:56.506
cmlljiep5003q13bix9p269lc	Put Oura ring back on	\N	3	f	cmlljgqxq003g13bij00xns0l	\N	2026-02-13 23:50:00.426	2026-02-13 23:50:00.426
cmlljixb9003u13bibb3wseyy	Nonfiction	\N	0	f	cmlljiuuz003s13bi6ky9qm3y	\N	2026-02-13 23:50:24.549	2026-02-13 23:50:24.549
cmlljj0ho003w13bifi0ztllr	Dinner	\N	1	f	cmlljiuuz003s13bi6ky9qm3y	\N	2026-02-13 23:50:28.669	2026-02-13 23:50:28.669
cmlljj2u3003y13bi36luwkki	Clean up	\N	2	f	cmlljiuuz003s13bi6ky9qm3y	\N	2026-02-13 23:50:31.707	2026-02-13 23:50:31.707
cmlljjeed004213bi6tswcqis	Finish water 2	\N	0	f	cmlljj6kn004013bi5n847b2j	\N	2026-02-13 23:50:46.693	2026-02-13 23:50:46.693
cmlljjius004413bidk068tgr	Wash dishes	\N	1	f	cmlljj6kn004013bi5n847b2j	\N	2026-02-13 23:50:52.468	2026-02-13 23:50:52.468
cmlljjln0004613bi2vci3asm	Put on Apple Watch	\N	2	f	cmlljj6kn004013bi5n847b2j	\N	2026-02-13 23:50:56.075	2026-02-13 23:50:56.075
cmlljjpzz004813bivkhj2szs	Floss + chapstick	\N	3	f	cmlljj6kn004013bi5n847b2j	\N	2026-02-13 23:51:01.728	2026-02-13 23:51:01.728
cmlljjw0l004a13bi9fbx20yh	Put retainer back on	\N	4	f	cmlljj6kn004013bi5n847b2j	\N	2026-02-13 23:51:09.525	2026-02-13 23:51:09.525
cmlljw8nx004f13bi1rtdj5ag	Task Management	\N	0	f	cmlljw3r0004d13biffa88qyx	\N	2026-02-14 00:00:45.789	2026-02-14 00:00:45.789
cmlljzbln004h13bi6ur57aax	Check emails	\N	1	f	cmlljw3r0004d13biffa88qyx	\N	2026-02-14 00:03:09.563	2026-02-14 00:03:09.563
cmlljzhw5004j13biri1aqesf	Journal: Today + Retrospective	\N	2	f	cmlljw3r0004d13biffa88qyx	\N	2026-02-14 00:03:17.718	2026-02-14 00:03:17.718
cmlljzwc4004l13bitnizbco7	Obsidian: Organize orphans & clean up tabs	\N	3	f	cmlljw3r0004d13biffa88qyx	\N	2026-02-14 00:03:36.436	2026-02-14 00:03:36.436
cmllk04pa004p13bi1sc5l6bi	Motegrity	\N	0	f	cmllk021j004n13bi3dx715jc	\N	2026-02-14 00:03:47.278	2026-02-14 00:03:47.278
cmllk07qd004r13bi0wlnd6y3	Brush teeth	\N	1	f	cmllk021j004n13bi3dx715jc	\N	2026-02-14 00:03:51.206	2026-02-14 00:03:51.206
cmllk09yf004t13bidnjlndvk	Chapstick	\N	2	f	cmllk021j004n13bi3dx715jc	\N	2026-02-14 00:03:54.087	2026-02-14 00:03:54.087
cmllk0fxs004x13biq2pnyq9d	Start BBB	\N	0	f	cmllk0cvx004v13biyxyjwyam	\N	2026-02-14 00:04:01.84	2026-02-14 00:04:01.84
cmllk0lgv004z13biub8xgkix	Lower lights + turn off iPad displays	\N	1	f	cmllk0cvx004v13biyxyjwyam	\N	2026-02-14 00:04:09.008	2026-02-14 00:04:13.549
cmllk0t60005113bi51xdb5kj	Clean any remaining dishes	\N	2	f	cmllk0cvx004v13biyxyjwyam	\N	2026-02-14 00:04:18.985	2026-02-14 00:04:18.985
cmllk0zku005313bizp1ga7f9	Fill up water bottle for tomorrow	\N	3	f	cmllk0cvx004v13biyxyjwyam	\N	2026-02-14 00:04:27.294	2026-02-14 00:04:27.294
cmllk178y005713bi0jp5ddkh	Stretch	\N	0	f	cmllk12j0005513bi6mgg9k1d	\N	2026-02-14 00:04:37.235	2026-02-14 00:04:37.235
cmllk1bqm005913bijjrnee3r	Relax on couch until sleepy	\N	1	f	cmllk12j0005513bi6mgg9k1d	\N	2026-02-14 00:04:43.054	2026-02-14 00:04:43.054
\.


--
-- Data for Name: RoutineItemCompletion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RoutineItemCompletion" (id, "itemId", "routineDate", "completedAt") FROM stdin;
cmlo91j8d005t13biwlzdbtj7	cmllfgkoz000ld6giaa3smq01	2026-02-15	2026-02-15 21:20:15.517
cmlo91jmk005v13bie83mw66x	cmllgwc3t000j5p5k6c620edw	2026-02-15	2026-02-15 21:20:16.028
cmlo91k40005x13bi1m70jonx	cmllgwgi3000l5p5k3ctw1s57	2026-02-15	2026-02-15 21:20:16.656
\.


--
-- Data for Name: Section; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Section" (id, name, "order", "projectId", "createdAt", "updatedAt") FROM stdin;
cmlhehckk0004o3uafyk6xqgg	To Do	0	cmlhehckk0003o3uam4z0076z	2026-02-11 02:18:08.228	2026-02-11 02:18:08.228
cmlhehckk0005o3uav5gr1tgk	In Progress	1	cmlhehckk0003o3uam4z0076z	2026-02-11 02:18:08.228	2026-02-11 02:18:08.228
cmlhehckk0006o3uarahub8zb	Done	2	cmlhehckk0003o3uam4z0076z	2026-02-11 02:18:08.228	2026-02-11 02:18:08.228
cmlitovzf00319l2kopqhi0k3	Blood Tests	0	cmlihmf6x00019l2kyn9z3mgf	2026-02-12 02:11:40.395	2026-02-12 02:11:40.395
cmliusz31000149jnoxbbtu4c	CT Scan	1	cmlihmf6x00019l2kyn9z3mgf	2026-02-12 02:42:50.653	2026-02-12 02:42:50.653
cmliutdtg000749jnfsd8i30t	Breath Test	2	cmlihmf6x00019l2kyn9z3mgf	2026-02-12 02:43:09.749	2026-02-12 02:43:09.749
cmlimurq1001s9l2k2k6gufea	Living Room/General	0	cmlimuab5001k9l2k2hht0xml	2026-02-11 23:00:17.498	2026-02-12 17:26:45.771
cmlimuj9i001m9l2klkasmrsr	Kitchen	1	cmlimuab5001k9l2k2hht0xml	2026-02-11 23:00:06.534	2026-02-12 17:26:45.771
cmlimvcm0001u9l2kux13x28h	Bedroom	2	cmlimuab5001k9l2k2hht0xml	2026-02-11 23:00:44.569	2026-02-12 17:26:45.771
cmlimunok001q9l2ksrygfxqt	Bathroom	3	cmlimuab5001k9l2k2hht0xml	2026-02-11 23:00:12.26	2026-02-12 17:26:45.771
cmlimuln5001o9l2kx20opd1n	Office	4	cmlimuab5001k9l2k2hht0xml	2026-02-11 23:00:09.617	2026-02-12 17:26:45.771
cmlimveye001w9l2k3mfljyrg	Home Gym	5	cmlimuab5001k9l2k2hht0xml	2026-02-11 23:00:47.606	2026-02-12 17:26:45.771
\.


--
-- Data for Name: Task; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Task" (id, content, description, priority, "isCompleted", "completedAt", "dueDate", "dueDateTime", "order", "projectId", "sectionId", "parentId", "createdAt", "updatedAt", "areaId") FROM stdin;
cmlhehcln000go3uah90t8lay	Plan weekend trip	\N	P4	f	\N	2026-02-18 02:18:08.244	\N	0	cmlhehckx0007o3uaeqqjobze	\N	\N	2026-02-11 02:18:08.267	2026-02-11 02:18:08.267	\N
cmlhehclp000io3uau19zm2yk	Buy groceries	Milk, eggs, bread, vegetables	P3	f	\N	\N	\N	0	cmlhehckz0008o3ua7jjjalu5	\N	\N	2026-02-11 02:18:08.269	2026-02-11 02:18:08.269	\N
cmlhehclq000ko3uafa1pxfcz	Get new running shoes	\N	P4	f	\N	\N	\N	1	cmlhehckz0008o3ua7jjjalu5	\N	\N	2026-02-11 02:18:08.271	2026-02-11 02:18:08.271	\N
cmlhehclr000mo3uaxl5zkeiv	Set up project repository	\N	P2	t	2026-02-11 02:18:08.271	\N	\N	0	cmlhehckk0003o3uam4z0076z	cmlhehckk0006o3uarahub8zb	\N	2026-02-11 02:18:08.272	2026-02-11 02:18:08.272	\N
cmlhehcl10009o3ua5w4g6kro	Review quarterly goals	\N	P2	t	2026-02-11 02:19:16.933	2026-02-11 02:18:08.244	\N	0	\N	\N	\N	2026-02-11 02:18:08.245	2026-02-11 02:19:16.934	\N
cmlhehclk000eo3uam94dfez9	Code review for PR #42	\N	P2	f	\N	\N	\N	0	cmlhehckk0003o3uam4z0076z	cmlhehckk0005o3uav5gr1tgk	\N	2026-02-11 02:18:08.265	2026-02-11 02:59:59.436	\N
cmli4suk400019hwn30q76g2j	test	\N	P4	f	\N	\N	\N	2	cmlhehckz0008o3ua7jjjalu5	\N	\N	2026-02-11 14:34:54.772	2026-02-11 14:34:54.772	\N
cmli7btdr00059hwn512oprtq	test	\N	P4	f	\N	2026-02-13 05:00:00	\N	1	cmlhehckx0007o3uaeqqjobze	\N	\N	2026-02-11 15:45:38.943	2026-02-14 01:23:28.629	\N
cmlilsl7t000j9l2kkmp3826v	Restring guitar w/ nylon strings at Guitar Center	While at Guitar Center, ask about direct phone focusrite setup	P4	f	\N	\N	\N	0	cmlikanfy000d9l2kswmso4z3	\N	\N	2026-02-11 22:30:36.136	2026-02-11 22:30:36.136	\N
cmlim03i1000l9l2kijfrrmy2	Get portable lighting	\N	P4	f	\N	\N	\N	1	cmlikanfy000d9l2kswmso4z3	\N	\N	2026-02-11 22:36:26.425	2026-02-11 22:36:26.425	\N
cmlim09l8000n9l2klwhqfs8o	Attempt direct phone plug-in one more time	\N	P4	f	\N	\N	\N	2	cmlikanfy000d9l2kswmso4z3	\N	\N	2026-02-11 22:36:34.317	2026-02-11 22:36:34.317	\N
cmlim0cgk000p9l2kmcrzwcou	Make a few test recordings	\N	P4	f	\N	\N	\N	3	cmlikanfy000d9l2kswmso4z3	\N	\N	2026-02-11 22:36:38.036	2026-02-11 22:36:38.036	\N
cmlln890h005q13bi99o1xsr4	Test	\N	P4	f	\N	2026-02-14 01:34:00.517	\N	8	\N	\N	\N	2026-02-14 01:34:04.962	2026-02-14 01:34:04.962	\N
cmlimvqlu001y9l2k89wifqez	Scotch guard ottoman/couch	\N	P4	f	\N	\N	\N	0	cmlimuab5001k9l2k2hht0xml	cmlimurq1001s9l2k2k6gufea	\N	2026-02-11 23:01:02.706	2026-02-14 01:24:58.499	\N
cmli64i0v00039hwnm99g6ov0	test	\N	P4	t	2026-02-11 15:24:19.659	2026-02-12 05:00:00	\N	4	\N	\N	\N	2026-02-11 15:11:58.015	2026-02-11 15:24:19.66	\N
cmlimw7lv00249l2kyivz6v7z	Soundproof all doors	\N	P4	f	\N	\N	\N	3	cmlimuab5001k9l2k2hht0xml	cmlimurq1001s9l2k2k6gufea	\N	2026-02-11 23:01:24.739	2026-02-14 01:24:58.499	\N
cmlimvz6l00209l2kr9u508vx	Order hallway runner rug?	\N	P4	f	\N	\N	\N	1	cmlimuab5001k9l2k2hht0xml	cmlimurq1001s9l2k2k6gufea	\N	2026-02-11 23:01:13.821	2026-02-14 01:24:58.499	\N
cmlimw4hx00229l2kfidkead7	Order new string lights for hallway	\N	P4	f	\N	\N	\N	2	cmlimuab5001k9l2k2hht0xml	cmlimurq1001s9l2k2k6gufea	\N	2026-02-11 23:01:20.709	2026-02-14 01:24:58.499	\N
cmlimwfvn00269l2k0py2ukp1	Figure out apartment-wide lighting situation	\N	P4	f	\N	\N	\N	4	cmlimuab5001k9l2k2hht0xml	cmlimurq1001s9l2k2k6gufea	\N	2026-02-11 23:01:35.46	2026-02-14 01:24:58.499	\N
cmlim3ckm000r9l2k0b5bwpe9	Order table to replace bookshelf	\N	P4	f	\N	\N	\N	0	cmlikcnrz000f9l2k2jevdcu2	\N	\N	2026-02-11 22:38:58.151	2026-02-11 22:38:58.151	\N
cmlimwm8e00289l2kqreyx6uy	Hangup art	\N	P4	f	\N	\N	\N	6	cmlimuab5001k9l2k2hht0xml	cmlimurq1001s9l2k2k6gufea	\N	2026-02-11 23:01:43.694	2026-02-14 01:24:58.499	\N
cmlieyaer000j9hwneqx63ha4	hello	\N	P4	f	\N	\N	\N	0	cmlhemfc10001tak4b34z8s3b	\N	\N	2026-02-11 19:19:04.755	2026-02-11 19:19:16.978	\N
cmlo944qf005z13biiw043whg	task 1	\N	P4	f	\N	\N	\N	0	cmliuee7u00339l2kqe12zt5n	\N	\N	2026-02-15 21:22:16.695	2026-02-15 21:22:16.695	\N
cmlhejbai0000tak4z1a1ulc6	Test	\N	P4	f	\N	\N	\N	2	cmlhehckx0007o3uaeqqjobze	\N	\N	2026-02-11 02:19:39.882	2026-02-11 19:56:41.128	\N
cmlibasly00069hwnbi3andd2	test 2	\N	P4	f	\N	\N	\N	5	cmlhehckz0008o3ua7jjjalu5	\N	\N	2026-02-11 17:36:49.75	2026-02-11 19:56:50.292	\N
cmlin98vd002n9l2kthcrmsvg	Clock/timer for shower	\N	P4	f	\N	\N	\N	12	cmlimuab5001k9l2k2hht0xml	cmlimunok001q9l2ksrygfxqt	\N	2026-02-11 23:11:32.905	2026-02-11 23:11:32.905	\N
cmlim3j69000t9l2k3ahp20kw	Reorganize storage to move current bookshelf stuff elsewhere	\N	P4	f	\N	\N	\N	1	cmlikcnrz000f9l2k2jevdcu2	\N	\N	2026-02-11 22:39:06.705	2026-02-11 22:39:06.705	\N
cmlim3nky000v9l2ktd8asix4	Breakdown bookshelf and throw away	\N	P4	f	\N	\N	\N	2	cmlikcnrz000f9l2k2jevdcu2	\N	\N	2026-02-11 22:39:12.418	2026-02-11 22:39:12.418	\N
cmlim3qet000x9l2k4vpg8nwv	Setup new table	\N	P4	f	\N	\N	\N	3	cmlikcnrz000f9l2k2jevdcu2	\N	\N	2026-02-11 22:39:16.086	2026-02-11 22:39:16.086	\N
cmlim4p6y000z9l2kowntev34	Get headshots	Research, choose, schedule for late feb/early march	P4	f	\N	\N	\N	0	cmlikdmjk000h9l2k9i2jr1q7	\N	\N	2026-02-11 22:40:01.162	2026-02-11 22:40:01.162	\N
cmlim4rgf00119l2klsd892pq	Update acting resume	\N	P4	f	\N	\N	\N	1	cmlikdmjk000h9l2k9i2jr1q7	\N	\N	2026-02-11 22:40:04.096	2026-02-11 22:40:04.096	\N
cmlim55vj00139l2khgfkuoxt	Finalize self-tape setup	Research/order lighting, backdrop, possibly mic	P4	f	\N	\N	\N	2	cmlikdmjk000h9l2k9i2jr1q7	\N	\N	2026-02-11 22:40:22.783	2026-02-11 22:40:22.783	\N
cmlin88f9002d9l2kqsyu9sf5	Order new, more powerful microwave	\N	P4	f	\N	\N	\N	7	cmlimuab5001k9l2k2hht0xml	cmlimuj9i001m9l2klkasmrsr	\N	2026-02-11 23:10:45.669	2026-02-11 23:10:45.669	\N
cmlin8cux002f9l2k1tm93sh8	Order better overhead lighting for kitchen	\N	P4	f	\N	\N	\N	8	cmlimuab5001k9l2k2hht0xml	cmlimuj9i001m9l2klkasmrsr	\N	2026-02-11 23:10:51.417	2026-02-11 23:10:51.417	\N
cmlin8ihu002h9l2kdzbz80x8	Gameplan shelf over stove setup	\N	P4	f	\N	\N	\N	9	cmlimuab5001k9l2k2hht0xml	cmlimuj9i001m9l2klkasmrsr	\N	2026-02-11 23:10:58.723	2026-02-11 23:10:58.723	\N
cmlin8o8m002j9l2kmo3i14ar	Order small printer	\N	P4	f	\N	\N	\N	10	cmlimuab5001k9l2k2hht0xml	cmlimuln5001o9l2kx20opd1n	\N	2026-02-11 23:11:06.166	2026-02-11 23:11:06.166	\N
cmlin9122002l9l2kvymypgqv	Decide on whether to install a shelf or other hanging accessories inside closet	\N	P4	f	\N	\N	\N	11	cmlimuab5001k9l2k2hht0xml	cmlimuln5001o9l2kx20opd1n	\N	2026-02-11 23:11:22.778	2026-02-11 23:11:22.778	\N
cmlin9ciw002p9l2k919ubyz0	Address piss stains on curtain	\N	P4	f	\N	\N	\N	13	cmlimuab5001k9l2k2hht0xml	cmlimunok001q9l2ksrygfxqt	\N	2026-02-11 23:11:37.64	2026-02-11 23:11:37.64	\N
cmlin9xjm002r9l2k0kwsy5jw	Get some tyep of shelving to put between bed and wall	\N	P4	f	\N	\N	\N	14	cmlimuab5001k9l2k2hht0xml	cmlimvcm0001u9l2kux13x28h	\N	2026-02-11 23:12:04.882	2026-02-11 23:12:04.882	\N
cmlina2hg002t9l2kwji5xd3r	Tape up gaps in top of bedroom windows	\N	P4	f	\N	\N	\N	15	cmlimuab5001k9l2k2hht0xml	cmlimvcm0001u9l2kux13x28h	\N	2026-02-11 23:12:11.284	2026-02-11 23:12:11.284	\N
cmlin66xh002b9l2k6ei5pncw	Text Jimena	\N	P4	t	2026-02-12 01:06:52.276	2026-02-11 23:09:02.786	\N	6	\N	\N	\N	2026-02-11 23:09:10.421	2026-02-12 01:06:52.278	\N
cmlinac06002v9l2kz8i1if8c	Order Spud inc straps to eventually get for cable ab workout	\N	P4	f	\N	\N	\N	16	cmlimuab5001k9l2k2hht0xml	cmlimveye001w9l2k3mfljyrg	\N	2026-02-11 23:12:23.622	2026-02-11 23:12:23.622	\N
cmlinafao002x9l2kz6t99b88	Order weight vest + weights	\N	P4	f	\N	\N	\N	17	cmlimuab5001k9l2k2hht0xml	cmlimveye001w9l2k3mfljyrg	\N	2026-02-11 23:12:27.888	2026-02-11 23:12:27.888	\N
cmlinaj7d002z9l2k1lh6erxn	Order olympic weight plates	\N	P4	f	\N	\N	\N	18	cmlimuab5001k9l2k2hht0xml	cmlimveye001w9l2k3mfljyrg	\N	2026-02-11 23:12:32.953	2026-02-11 23:12:32.953	\N
cmliuglwg00399l2kpqn2krp5	Setup Monarch tracking plan	\N	P4	f	\N	\N	\N	0	cmlihmjcq00039l2khxh4t3ph	\N	\N	2026-02-12 02:33:13.696	2026-02-12 02:33:13.696	\N
cmliugohn003b9l2kfap60vim	Create budgets	\N	P4	f	\N	\N	\N	1	cmlihmjcq00039l2khxh4t3ph	\N	\N	2026-02-12 02:33:17.052	2026-02-12 02:33:17.052	\N
cmliuh06q003d9l2kxr3whyck	Look into creating personal financial tracker	\N	P4	f	\N	\N	\N	2	cmlihmjcq00039l2khxh4t3ph	\N	\N	2026-02-12 02:33:32.209	2026-02-12 02:33:32.209	\N
cmliutkkk000b49jn9tgx4gbk	Turn in breath test	\N	P4	f	\N	\N	\N	1	cmlihmf6x00019l2kyn9z3mgf	cmliutdtg000749jnfsd8i30t	\N	2026-02-12 02:43:18.5	2026-02-12 02:48:17.531	\N
cmliut5rg000349jnks1ft1nb	Get quote for CT scan & confirm coverage	\N	P4	f	\N	\N	\N	0	cmlihmf6x00019l2kyn9z3mgf	cmliusz31000149jnoxbbtu4c	\N	2026-02-12 02:42:59.308	2026-02-12 02:49:54.147	\N
cmliut8k0000549jnbynl7x00	Schedule CT scan	\N	P4	f	\N	\N	\N	1	cmlihmf6x00019l2kyn9z3mgf	cmliusz31000149jnoxbbtu4c	\N	2026-02-12 02:43:02.928	2026-02-12 02:49:54.147	\N
cmliutirj000949jnyzl2wrcs	Take breath test	\N	P4	f	\N	\N	\N	0	cmlihmf6x00019l2kyn9z3mgf	cmliutdtg000749jnfsd8i30t	\N	2026-02-12 02:43:16.16	2026-02-12 02:50:53.808	\N
cmliuvyry000f49jnqcadhmsw	Confirm what labcorp locations are covered	\N	P4	f	\N	\N	\N	0	cmlihmf6x00019l2kyn9z3mgf	cmlitovzf00319l2kopqhi0k3	\N	2026-02-12 02:45:10.222	2026-02-12 04:39:38.152	\N
cmliuvtgs000d49jnxr4py62t	Get out of pocket labcorp quote & confirm coverage	<p>Try to get coverage in writing from Anthem</p>	P4	f	\N	\N	\N	1	cmlihmf6x00019l2kyn9z3mgf	cmlitovzf00319l2kopqhi0k3	\N	2026-02-12 02:45:03.341	2026-02-12 17:26:26.547	\N
cmliyx6o8000o49jnbvoy5v39	Schedule cancelling Google AI premium	\N	P4	t	2026-02-12 22:30:09.573	\N	\N	7	\N	\N	\N	2026-02-12 04:38:05.576	2026-02-12 22:30:09.573	\N
cmlimwp89002a9l2kqf5eyevh	Figure out scent situation	\N	P4	f	\N	\N	\N	5	cmlimuab5001k9l2k2hht0xml	cmlimurq1001s9l2k2k6gufea	\N	2026-02-11 23:01:47.578	2026-02-14 01:24:58.499	\N
cmlhehclh000co3uamtiwna5w	Prepare presentation for Monday	<p></p>	P1	t	2026-02-14 01:33:58.501	2026-02-13 05:00:00	\N	0	cmlhehckk0003o3uam4z0076z	cmlhehckk0004o3uafyk6xqgg	\N	2026-02-11 02:18:08.261	2026-02-14 01:33:58.503	\N
cmlmkef0n005r13bip6okhk7x	Fuck bitches	\N	P4	f	\N	2026-02-14 17:02:37.218	\N	9	\N	\N	\N	2026-02-14 17:02:40.007	2026-02-14 17:02:40.007	\N
cmliuw2nh000h49jneyffw80n	Schedule lapcorp appt	\N	P4	f	\N	\N	\N	2	cmlihmf6x00019l2kyn9z3mgf	cmlitovzf00319l2kopqhi0k3	\N	2026-02-12 02:45:15.245	2026-02-12 04:28:14.979	\N
\.


--
-- Data for Name: TaskLabel; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TaskLabel" ("taskId", "labelId", "assignedAt") FROM stdin;
cmlhehcl10009o3ua5w4g6kro	cmlhehck80000o3ualqor3jpb	2026-02-11 02:18:08.245
cmlhehclk000eo3uam94dfez9	cmlhehck80000o3ualqor3jpb	2026-02-11 02:18:08.265
cmlhehcln000go3uah90t8lay	cmlhehckg0001o3uabjjfednh	2026-02-11 02:18:08.267
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
cc9bb790-b9ac-46fa-83af-baca80405d47	cc90f93d7bb11d5a1bf40e5f6ccfc3da3848538a45a884cb5d18ad36c788f648	2026-02-11 02:17:51.501521+00	20260211021751_init	\N	\N	2026-02-11 02:17:51.469617+00	1
e5b82848-57da-474b-bea8-4ace14696243	ec437cee822a86d554a8823bbdcc0b9df8cdecdfe06eb59389ed6a80f518eae8	2026-02-11 02:25:18.780532+00	20260211022518_add_project_description	\N	\N	2026-02-11 02:25:18.777606+00	1
6ea6919a-678a-4f77-90f5-801cd349cd20	2936fe4cd0442d1ecb72681562ff8f2680963a8c1d11b9c43ae9ddbafaf6a70b	2026-02-11 03:10:19.371072+00	20260211031019_add_project_timeline_weeks	\N	\N	2026-02-11 03:10:19.367705+00	1
f02d62db-f24c-4cbf-af1d-80694fb73448	59e40024cd4a5df3fa06c6403b8b362800fff568bf140b62f57172ea5e0d950e	2026-02-11 03:19:46.534875+00	20260211031946_add_areas_and_goals	\N	\N	2026-02-11 03:19:46.514019+00	1
a3e8dc4d-fef6-4cdf-89d6-605d064acaa7	5c1c3f4342a3c6f3b793405cd78788aea79503157727ce80bc473dc081126e90	2026-02-11 03:42:17.431379+00	20260211034217_link_projects_to_areas	\N	\N	2026-02-11 03:42:17.422348+00	1
8caf14a3-df67-4b6d-9a5c-e3bd3dcc3e93	3ace8d9aa6e8de797dff94dd63dc1fbdf37c0958d8cbee7c90d3e8380a5fc43c	2026-02-11 20:18:23.355176+00	20260211201823_add_area_to_task	\N	\N	2026-02-11 20:18:23.345296+00	1
73a071c9-12df-4883-8256-cb8901b71b45	4e0db1272bbc3cef382354343a3c3c89b0068c46bcd08d461d6eb66d1bffbfb4	2026-02-12 22:14:00.519332+00	20260212221400_add_planning_notes	\N	\N	2026-02-12 22:14:00.500195+00	1
e950556d-f1b7-4909-885d-b94e9ea24575	00dc93397d062807162122caa52ebfae5f2602ea5b43e1e63cfb253cc5fa5718	2026-02-13 21:43:53.519554+00	20260213214353_add_routines	\N	\N	2026-02-13 21:43:53.490066+00	1
\.


--
-- PostgreSQL database dump complete
--

\unrestrict mbRYJqyBQFwya7Hx87kf29P18nRgmp4INmIjTzl2L7daU0L7LWH3U8aBfaLvIZ8

