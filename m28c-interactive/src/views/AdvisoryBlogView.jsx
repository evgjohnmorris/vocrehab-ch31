import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, User, Calendar, MessageSquare, ArrowLeft, Send, BookOpen, ExternalLink, Scale } from 'lucide-react';
import publicLaws from '../data/authority/public-laws.json';

const DEFAULT_POSTS = [
  {
    id: 1,
    title: "VR&E Chapter 31 FY 2026 payment rates & computer package guidelines published",
    date: "May 25, 2026",
    author: "VA Advisory Board",
    category: "Payment Rates",
    body: "The Department of Veterans Affairs has published the official subsistence allowance payment rates for Fiscal Year 2026 under 38 U.S.C. Chapter 31. The new standard institutional full-time rate is $812.84 for veterans with no dependents, $1,008.24 with one dependent, and $1,188.15 with two dependents. Each additional dependent increases the rate by $86.58. Additionally, the standard computer package benchmark value under 38 C.F.R. § 21.212 has been set at $2,000.00. Vocational Rehabilitation Counselors (VRCs) are instructed to authorize standard packages meeting this value for veterans whose educational objectives require computer access. If your counselor attempts to deny a computer package or authorization, demand a written statement of reasons on VA Form 20-0998 under the provisions of 38 C.F.R. § 21.198.",
    tags: ["M28C", "Rates", "Laptops"]
  },
  {
    id: 2,
    title: "Understanding the hierarchy of VR&E authority: 38 U.S.C. takes precedent over M28C guidelines",
    date: "May 18, 2026",
    author: "Legal Counsel",
    category: "Legal Authority",
    body: "Many Veterans and Advocates are misled by VRCs quoting internal KnowVA M28C manual guidelines as binding law. It is crucial to understand the administrative law hierarchy of precedent outlined in 38 C.F.R. § 21.40 and M28C.I.A.1.04. Statutes enacted by Congress under Title 38 of the United States Code (U.S.C.) carry the highest legal authority. Implementing regulations published in Title 38 of the Code of Federal Regulations (C.F.R.) carry binding force of law next. The M28C manual is merely internal guidance for staff and cannot supersede statutes or regulations. When constructing dispute arguments on VA Form 20-0995 or 20-0996, always anchor your points to specific C.F.R. regulations (e.g. 38 C.F.R. § 21.212 for supplies) rather than manual directives.",
    tags: ["38 USC", "38 CFR", "Precedent"]
  },
  {
    id: 3,
    title: "Strategic self-advocacy guide: How to rebut a proposed discontinuance notice (VAF 28-0998)",
    date: "April 29, 2026",
    author: "VSO Liaison",
    category: "Self-Advocacy",
    body: "Receiving a notice of proposed discontinuance of Chapter 31 benefits can be alarming. However, under 38 C.F.R. § 21.360, the VA cannot discontinue your rehabilitation plan without providing a 30-day written notice and an opportunity to request a hearing. To successfully rebut a proposed discontinuance, you must submit a formal statement on VA Form 21-4138 within the 30-day window. Detail how you have maintained cooperation, identify any counselor failures to provide agreed-upon accommodations, and state how the proposed closure is premature under 38 C.F.R. § 21.197. This locks the case file and prevents automatic termination until the review is resolved.",
    tags: ["Discontinuance", "Hearings", "Appeals"]
  },
  {
    id: 4,
    title: "Independent Living Program (ILP) statutory caps & veteran rights",
    date: "March 15, 2026",
    author: "ILP Specialist",
    category: "Independent Living",
    body: "The Independent Living Program (ILP) is a specialized track under Chapter 31 designed for veterans with serious employment handicaps who cannot currently pursue a vocational goal. Under 38 U.S.C. § 3105, the VA has a statutory cap limiting new ILP enrollments to 2,700 cases per fiscal year nationwide. Because of this cap, VRCs often discourage veterans from applying or issue verbal feasibility denials. If you are seeking ILP, demand a formal evaluation using VA Form 28-0791. Under 38 C.F.R. § 21.50, you are entitled to a formal written feasibility determination. If denied, the VA must provide a detailed notice of reasons and notice of appeal rights.",
    tags: ["ILP", "Feasibility", "Caps"]
  }
];

const DEFAULT_COMMENTS = {
  1: [
    { id: 1, author: "Veteran_Al", date: "May 25, 2026 @ 11:34 PM", text: "Finally some clear rate numbers! My counselor tried to tell me the computer package cap was only $1,000, so I'm showing them C.F.R. 21.212 tomorrow." },
    { id: 2, author: "VSO_Sarah", date: "May 26, 2026 @ 9:15 AM", text: "Remember to ensure your school SCO submits the billing authorization on time. A delay in SCO certification often triggers payment delays that are blamed on the vet." }
  ],
  2: [
    { id: 1, author: "LegalAdvocate", date: "May 19, 2026 @ 2:40 PM", text: "This hierarchy is the golden rule of VA litigation. The manual is not law. We won three administrative reviews this quarter just by quoting the CFR over M28C guidelines." }
  ]
};

function AdvisoryBlogView({ reduceMotion, privacyMode = true, setActiveView, setSelectedSection }) {
  const [posts] = useState(DEFAULT_POSTS);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Commenting States
  const [comments, setComments] = useState(() => {
    const storage = privacyMode ? sessionStorage : localStorage;
    const saved = storage.getItem('m28c_blog_comments');
    return saved ? JSON.parse(saved) : DEFAULT_COMMENTS;
  });

  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    const storage = privacyMode ? sessionStorage : localStorage;
    storage.setItem('m28c_blog_comments', JSON.stringify(comments));
  }, [comments, privacyMode]);

  const handleAddComment = (postId, e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      setCommentError("Comment text cannot be empty.");
      return;
    }

    const name = commentName.trim() || "Anonymous Veteran";
    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).replace(',', ' @');

    const newComment = {
      id: Date.now(),
      author: name,
      date: timestamp,
      text: commentText.trim()
    };

    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));

    setCommentName('');
    setCommentText('');
    setCommentError('');
  };

  const handleSelectPost = (postId) => {
    setSelectedPostId(postId);
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  // Real-time search filter
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedPost = posts.find(p => p.id === selectedPostId);

  return (
    <motion.div
      initial={reduceMotion ? {} : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounders-theme select-text"
      style={{
        padding: '12px 0 40px',
        textAlign: 'left',
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}
    >
      <div id="content" className="mx-auto" style={{ maxWidth: '1220px', display: 'grid', gap: '28px' }}>
        
        {/* BLOG HEADER */}
        <div 
          id="header"
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '34px',
            background: 'linear-gradient(135deg, #20332c 0%, #35564a 45%, #8d6450 100%)',
            boxShadow: '0 36px 90px rgba(20, 26, 23, 0.18)',
            color: '#fffaf4'
          }}
        >
          {/* Background Decorative Rings */}
          <div style={{
            position: 'absolute',
            top: '-160px',
            right: '-70px',
            width: '360px',
            height: '360px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            left: '-52px',
            bottom: '-92px',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(239, 224, 210, 0.25) 0%, rgba(239, 224, 210, 0) 70%)',
            pointerEvents: 'none'
          }} />

          {/* Header Layout */}
          <div style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(240px, 0.8fr)',
            gap: '30px',
            alignItems: 'end',
            padding: '44px 44px 38px'
          }} className="header-grid-layout">
            <div>
              <h1 id="blog-title" style={{
                margin: 0,
                padding: 0,
                color: '#fffaf4',
                font: '700 3.2rem/0.95 "Fraunces", Georgia, serif',
                letterSpacing: '-0.045em'
              }}>
                <span style={{ cursor: 'pointer' }} onClick={() => setSelectedPostId(null)}>Rounders Magazine</span>
              </h1>
              <p id="description" style={{
                margin: 0,
                padding: '18px 0 0 24px',
                borderLeft: '1px solid rgba(255, 250, 244, 0.28)',
                color: 'rgba(255, 250, 244, 0.84)',
                fontSize: '1rem',
                lineHeight: '1.8',
                marginTop: '15px'
              }}>
                Interactive Chapter 31 VR&E and Veteran Self-Advocacy Advisory Board
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
              <div className="relative w-full">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-350">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '999px',
                    padding: '8px 12px 8px 36px',
                    fontSize: '0.8rem',
                    color: '#fff',
                    outline: 'none'
                  }}
                  className="placeholder-slate-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* LAYOUT CONTAINER */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '28px' }} className="blog-body-grid">
          
          {/* MAIN COLUMN */}
          <div id="main">
            <div id="main2">
              <div id="main3" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {selectedPostId ? (
                  // SINGLE ARTICLE PAGE (ItemPage Mode)
                  <div className="single-article-view" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <button 
                      onClick={() => setSelectedPostId(null)}
                      style={{
                        alignSelf: 'flex-start',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: 'var(--primary-color)',
                        border: '1px solid var(--card-border)',
                        backgroundColor: 'var(--card-bg)',
                        borderRadius: '999px',
                        padding: '6px 14px',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <ArrowLeft size={12} />
                      <span>Back to All Articles</span>
                    </button>

                    <div 
                      className="post"
                      style={{
                        padding: '34px',
                        border: '1px solid var(--card-border)',
                        borderRadius: '32px',
                        backgroundColor: 'var(--card-bg)',
                        boxShadow: 'var(--shadow-strong)'
                      }}
                    >
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        backgroundColor: 'var(--hover-bg)',
                        color: 'var(--accent-color)',
                        borderRadius: '999px',
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '14px'
                      }}>
                        {selectedPost.category}
                      </span>
                      
                      <h2 className="post-title" style={{
                        margin: 0,
                        color: 'var(--text-primary)',
                        font: '700 2.2rem/1.05 "Fraunces", Georgia, serif',
                        letterSpacing: '-0.04em',
                        marginBottom: '18px'
                      }}>
                        {selectedPost.title}
                      </h2>

                      <div className="post-body" style={{
                        fontSize: '1.05rem',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.8'
                      }}>
                        <p>
                          <span style={{
                            float: 'left',
                            margin: '0.02em 0.12em 0 0',
                            color: 'var(--accent-color)',
                            font: '700 3.1em/0.85 "Fraunces", Georgia, serif'
                          }}>
                            {selectedPost.body.charAt(0)}
                          </span>
                          {selectedPost.body.slice(1)}
                        </p>
                      </div>

                      <p className="post-footer" style={{
                        margin: '30px 0 0',
                        padding: '16px 0 0',
                        borderTop: '1px solid var(--card-border)',
                        color: 'var(--text-muted)',
                        fontSize: '0.76rem',
                        display: 'flex',
                        gap: '14px',
                        alignItems: 'center'
                      }}>
                        <User size={12} />
                        <span>Posted by <strong>{selectedPost.author}</strong></span>
                        <Calendar size={12} style={{ marginLeft: '10px' }} />
                        <span>{selectedPost.date}</span>
                      </p>
                    </div>

                    {/* COMMENTS LIST & FORM */}
                    <div 
                      id="comments"
                      style={{
                        padding: '30px',
                        border: '1px solid var(--card-border)',
                        borderRadius: '26px',
                        backgroundColor: 'var(--card-bg)',
                        boxShadow: 'var(--shadow)'
                      }}
                    >
                      <h4 style={{
                        margin: '0 0 20px',
                        color: 'var(--text-primary)',
                        font: '700 1.52rem/1.1 "Fraunces", Georgia, serif',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <MessageSquare size={20} className="text-emerald-500" />
                        <span>Comments ({comments[selectedPost.id]?.length || 0})</span>
                      </h4>

                      <dl id="comments-block" style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {(comments[selectedPost.id] || []).map(comment => (
                          <div 
                            key={comment.id} 
                            style={{
                              border: '1px solid var(--card-border)',
                              borderRadius: '18px',
                              backgroundColor: 'rgba(255, 252, 246, 0.55)',
                              overflow: 'hidden'
                            }}
                          >
                            <dt className="comment-data" style={{
                              padding: '10px 16px',
                              borderBottom: '1px solid var(--card-border)',
                              backgroundColor: 'rgba(0, 0, 0, 0.02)',
                              fontSize: '0.78rem',
                              color: 'var(--text-muted)',
                              display: 'flex',
                              justifyContent: 'space-between'
                            }}>
                              <span>
                                <strong className="comment-poster" style={{ color: 'var(--primary-color)' }}>{comment.author}</strong> said:
                              </span>
                              <span>{comment.date}</span>
                            </dt>
                            <dd className="comment-body" style={{
                              margin: 0,
                              padding: '14px 16px',
                              fontSize: '0.86rem',
                              color: 'var(--text-secondary)',
                              lineHeight: '1.6'
                            }}>
                              {comment.text}
                            </dd>
                          </div>
                        ))}

                        {(!comments[selectedPost.id] || comments[selectedPost.id].length === 0) && (
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0' }}>
                            No comments yet. Be the first to share your experience!
                          </p>
                        )}
                      </dl>

                      {/* ADD COMMENT FORM */}
                      <form onSubmit={(e) => handleAddComment(selectedPost.id, e)} style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--card-border)' }}>
                        <h5 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>Leave a Comment</h5>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }} className="comment-inputs-grid">
                            <input 
                              type="text" 
                              placeholder="Your Name (Optional)" 
                              value={commentName}
                              onChange={(e) => setCommentName(e.target.value)}
                              style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                border: '1px solid var(--card-border)',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                fontSize: '0.8rem',
                                color: 'var(--text-primary)',
                                outline: 'none'
                              }}
                            />
                            <input 
                              type="text" 
                              placeholder="Write your comment here..." 
                              value={commentText}
                              onChange={(e) => {
                                setCommentText(e.target.value);
                                if (commentError) setCommentError('');
                              }}
                              style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                border: '1px solid var(--card-border)',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                fontSize: '0.8rem',
                                color: 'var(--text-primary)',
                                outline: 'none'
                              }}
                            />
                          </div>

                          {commentError && (
                            <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold' }}>{commentError}</span>
                          )}

                          <button 
                            type="submit"
                            style={{
                              alignSelf: 'flex-end',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              backgroundColor: 'var(--active-bg)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px 16px',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              boxShadow: 'var(--shadow-sm)'
                            }}
                          >
                            <Send size={12} />
                            <span>Submit Comment</span>
                          </button>
                        </div>
                      </form>
                    </div>

                  </div>
                ) : (
                  // BLOG INDEX PAGE
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {filteredPosts.map((post, index) => {
                      const isFirst = index === 0;
                      return (
                        <div 
                          key={post.id}
                          className="post"
                          style={{
                            border: '1px solid var(--card-border)',
                            borderRadius: '32px',
                            backgroundColor: 'var(--card-bg)',
                            boxShadow: 'var(--shadow)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-strong)';
                            e.currentTarget.style.borderColor = 'rgba(28, 38, 33, 0.18)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = 'var(--shadow)';
                            e.currentTarget.style.borderColor = 'var(--card-border)';
                          }}
                          onClick={() => handleSelectPost(post.id)}
                        >
                          {isFirst ? (
                            // First Post Layout: Dual-column grid style
                            <div className="first-post-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(220px, 0.7fr)', alignItems: 'stretch' }}>
                              <div>
                                <h3 className="post-title" style={{
                                  margin: 0,
                                  padding: '34px 34px 14px',
                                  color: 'var(--text-primary)',
                                  font: '700 2.4rem/1.02 "Fraunces", Georgia, serif',
                                  letterSpacing: '-0.04em'
                                }}>
                                  {post.title}
                                </h3>
                                <div style={{
                                  width: '84px',
                                  height: '4px',
                                  margin: '0 0 14px 34px',
                                  borderRadius: '999px',
                                  background: 'linear-gradient(90deg, var(--accent-color), rgba(172, 90, 57, 0.2))'
                                }} />
                                <div className="post-body" style={{
                                  padding: '0 34px 30px',
                                  color: 'var(--text-secondary)',
                                  fontSize: '0.96rem',
                                  lineHeight: '1.75'
                                }}>
                                  <p>
                                    <span style={{
                                      float: 'left',
                                      margin: '0.02em 0.12em 0 0',
                                      color: 'var(--accent-color)',
                                      font: '700 3.1em/0.85 "Fraunces", Georgia, serif'
                                    }}>
                                      {post.body.charAt(0)}
                                    </span>
                                    {post.body.slice(1, 280)}...
                                  </p>
                                </div>
                              </div>
                              
                              {/* Sidebar part of first post */}
                              <div style={{
                                borderLeft: '1px solid var(--card-border)',
                                background: 'linear-gradient(180deg, rgba(38, 72, 63, 0.06), rgba(255, 255, 255, 0))',
                                padding: '30px 24px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                              }} className="first-post-sidebar">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <span style={{
                                    alignSelf: 'flex-start',
                                    padding: '4px 10px',
                                    backgroundColor: 'var(--hover-bg)',
                                    color: 'var(--accent-color)',
                                    borderRadius: '999px',
                                    fontSize: '0.62rem',
                                    fontWeight: '800',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                  }}>
                                    Featured Article
                                  </span>
                                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                    Official rates publication for active Chapters under Title 38.
                                  </p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                    By <strong>{post.author}</strong>
                                  </span>
                                  <span className="comment-link" style={{
                                    display: 'inline-block',
                                    padding: '0.48rem 0.85rem',
                                    borderRadius: '999px',
                                    backgroundColor: 'var(--hover-bg)',
                                    color: 'var(--accent-color)',
                                    fontWeight: '700',
                                    fontSize: '0.7rem',
                                    textAlign: 'center'
                                  }}>
                                    Read Full Post & Comments ({comments[post.id]?.length || 0})
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // Standard Post Layout
                            <div style={{ padding: '24px 26px' }}>
                              <span style={{
                                display: 'inline-block',
                                padding: '3px 8px',
                                backgroundColor: 'var(--hover-bg)',
                                color: 'var(--accent-color)',
                                borderRadius: '999px',
                                fontSize: '0.65rem',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                marginBottom: '10px'
                              }}>
                                {post.category}
                              </span>

                              <h3 className="post-title" style={{
                                margin: 0,
                                color: 'var(--text-primary)',
                                font: '700 1.62rem/1.05 "Fraunces", Georgia, serif',
                                letterSpacing: '-0.03em',
                                marginBottom: '10px'
                              }}>
                                {post.title}
                              </h3>

                              <div className="post-body" style={{
                                color: 'var(--text-secondary)',
                                fontSize: '0.88rem',
                                lineHeight: '1.68',
                                marginBottom: '16px'
                              }}>
                                <p>{post.body.slice(0, 200)}...</p>
                              </div>

                              <p className="post-footer" style={{
                                margin: 0,
                                padding: '14px 0 0',
                                borderTop: '1px solid var(--card-border)',
                                color: 'var(--text-muted)',
                                fontSize: '0.72rem',
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '14px',
                                alignItems: 'center'
                              }}>
                                <span>By <strong>{post.author}</strong></span>
                                <span>{post.date}</span>
                                <span className="comment-link" style={{
                                  marginLeft: 'auto',
                                  padding: '0.38rem 0.75rem',
                                  borderRadius: '999px',
                                  backgroundColor: 'var(--hover-bg)',
                                  color: 'var(--accent-color)',
                                  fontWeight: '700',
                                  fontSize: '0.68rem'
                                }}>
                                  Comments ({comments[post.id]?.length || 0})
                                </span>
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {filteredPosts.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '18px' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No articles match your search parameters.</p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* SIDEBAR COLUMN */}
          <div id="sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* PROFILE WIDGET */}
            <div 
              id="profile-container" 
              style={{
                border: '1px solid var(--card-border)',
                borderTop: '4px solid var(--primary-color)',
                borderRadius: '26px',
                backgroundColor: 'var(--card-bg)',
                boxShadow: 'var(--shadow)',
                overflow: 'hidden',
                padding: '20px'
              }}
            >
              <h2 className="sidebar-title" style={{
                margin: '0 0 12px',
                color: 'var(--text-primary)',
                font: '800 0.75rem/1.3 "Manrope", sans-serif',
                letterSpacing: '0.22em',
                textTransform: 'uppercase'
              }}>
                Advisory Board
              </h2>
              
              <div className="profile-datablock" style={{ borderTop: '1px solid var(--card-border)', paddingTop: '14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div 
                  className="profile-img" 
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--active-bg)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '1.2rem',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.08)'
                  }}
                >
                  VR&E
                </div>
                <div className="profile-data" style={{ fontSize: '0.8rem' }}>
                  <strong style={{ display: 'block', color: 'var(--text-primary)' }}>Chapter 31 Advocacy</strong>
                  <span style={{ color: 'var(--text-muted)' }}>Veterans Helping Veterans</span>
                </div>
              </div>
              
              <p className="profile-textblock" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '12px', marginHorizontal: 0 }}>
                This advisory blog synthesizes federal statutes, C.F.R. regulations, and operational manuals to empower disabled veterans with strategic self-advocacy.
              </p>
            </div>

            {/* PUBLIC LAW CROSS-WALK WIDGET */}
            <div 
              className="box"
              style={{
                border: '1px solid var(--card-border)',
                borderTop: '4px solid var(--accent-color)',
                borderRadius: '26px',
                backgroundColor: 'var(--card-bg)',
                boxShadow: 'var(--shadow)',
                overflow: 'hidden',
                padding: '20px'
              }}
            >
              <h2 className="sidebar-title" style={{
                margin: '0 0 12px',
                color: 'var(--text-primary)',
                font: '800 0.75rem/1.3 "Manrope", sans-serif',
                letterSpacing: '0.22em',
                textTransform: 'uppercase'
              }}>
                Legislative Cross-Walk
              </h2>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '14px' }}>
                Key Public Laws amending Chapter 31 VR&E rules. Click to view full details in the Authority Library.
              </p>
              
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {publicLaws.slice(0, 6).map(pl => (
                  <li 
                    key={pl.id} 
                    style={{ 
                      borderBottom: '1px solid rgba(28, 38, 33, 0.06)', 
                      paddingBottom: '10px' 
                    }}
                  >
                    <button
                      onClick={() => {
                        if (setSelectedSection && setActiveView) {
                          setSelectedSection({ type: 'public-law', id: pl.id });
                          setActiveView('authority_library');
                        }
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        textAlign: 'left',
                        cursor: 'pointer',
                        width: '100%',
                        display: 'block'
                      }}
                    >
                      <strong style={{ 
                        fontSize: '0.8rem', 
                        color: 'var(--accent-color)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        textDecoration: 'underline' 
                      }}>
                        <Scale size={11} />
                        <span>{pl.citation}</span>
                      </strong>
                      <span style={{ 
                        display: 'block', 
                        fontSize: '0.74rem', 
                        color: 'var(--text-primary)', 
                        fontWeight: '700',
                        marginTop: '3px',
                        lineHeight: '1.4'
                      }}>
                        {pl.title}
                      </span>
                      <span style={{ 
                        display: 'block', 
                        fontSize: '0.7rem', 
                        color: 'var(--text-secondary)',
                        marginTop: '4px',
                        lineHeight: '1.4' 
                      }}>
                        {pl.impact}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* LINKS WIDGET */}
            <div 
              className="box"
              style={{
                border: '1px solid var(--card-border)',
                borderTop: '4px solid var(--primary-color)',
                borderRadius: '26px',
                backgroundColor: 'var(--card-bg)',
                boxShadow: 'var(--shadow)',
                overflow: 'hidden',
                padding: '20px'
              }}
            >
              <h2 className="sidebar-title" style={{
                margin: '0 0 12px',
                color: 'var(--text-primary)',
                font: '800 0.75rem/1.3 "Manrope", sans-serif',
                letterSpacing: '0.22em',
                textTransform: 'uppercase'
              }}>
                Official Resources
              </h2>
              
              <ul className="box2" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li style={{ borderBottom: '1px solid rgba(28, 38, 33, 0.08)', paddingBottom: '8px' }}>
                  <a 
                    href="https://www.knowva.ebenefits.va.gov" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '4px' }}
                  >
                    <span>KnowVA KM Portal</span>
                    <ExternalLink size={12} className="text-slate-450" />
                  </a>
                </li>
                <li style={{ borderBottom: '1px solid rgba(28, 38, 33, 0.08)', paddingBottom: '8px' }}>
                  <a 
                    href="https://www.ecfr.gov/current/title-38/chapter-I/part-21" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '4px' }}
                  >
                    <span>eCFR Title 38 Part 21</span>
                    <ExternalLink size={12} className="text-slate-450" />
                  </a>
                </li>
                <li style={{ paddingBottom: '4px' }}>
                  <a 
                    href="https://www.benefits.va.gov/vocrehab/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '4px' }}
                  >
                    <span>VA VR&E Website</span>
                    <ExternalLink size={12} className="text-slate-450" />
                  </a>
                </li>
              </ul>
            </div>

            {/* PREVIOUS POSTS */}
            <div 
              className="box"
              style={{
                border: '1px solid var(--card-border)',
                borderTop: '4px solid var(--primary-color)',
                borderRadius: '26px',
                backgroundColor: 'var(--card-bg)',
                boxShadow: 'var(--shadow)',
                overflow: 'hidden',
                padding: '20px'
              }}
            >
              <h2 className="sidebar-title" style={{
                margin: '0 0 12px',
                color: 'var(--text-primary)',
                font: '800 0.75rem/1.3 "Manrope", sans-serif',
                letterSpacing: '0.22em',
                textTransform: 'uppercase'
              }}>
                Recent Articles
              </h2>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {posts.map(p => (
                  <li 
                    key={p.id}
                    style={{
                      borderBottom: '1px solid rgba(28, 38, 33, 0.08)',
                      paddingBottom: '8px',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleSelectPost(p.id)}
                  >
                    <span 
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: selectedPostId === p.id ? '800' : '600',
                        color: selectedPostId === p.id ? 'var(--accent-color)' : 'var(--text-secondary)'
                      }}
                      className="hover:underline"
                    >
                      {p.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ARCHIVES WIDGET */}
            <div 
              className="box"
              style={{
                border: '1px solid var(--card-border)',
                borderTop: '4px solid var(--primary-color)',
                borderRadius: '26px',
                backgroundColor: 'var(--card-bg)',
                boxShadow: 'var(--shadow)',
                overflow: 'hidden',
                padding: '20px'
              }}
            >
              <h2 className="sidebar-title" style={{
                margin: '0 0 12px',
                color: 'var(--text-primary)',
                font: '800 0.75rem/1.3 "Manrope", sans-serif',
                letterSpacing: '0.22em',
                textTransform: 'uppercase'
              }}>
                Archives
              </h2>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <li>
                  <span style={{ cursor: 'pointer', fontWeight: '700' }} onClick={() => setSelectedPostId(null)}>May 2026</span>
                </li>
                <li>
                  <span style={{ cursor: 'pointer', fontWeight: '700' }} onClick={() => setSelectedPostId(null)}>April 2026</span>
                </li>
                <li>
                  <span style={{ cursor: 'pointer', fontWeight: '700' }} onClick={() => setSelectedPostId(null)}>March 2026</span>
                </li>
              </ul>
            </div>

            {/* FEEDS */}
            <div 
              className="box"
              style={{
                border: '1px solid var(--card-border)',
                borderTop: '4px solid var(--primary-color)',
                borderRadius: '26px',
                backgroundColor: 'var(--card-bg)',
                boxShadow: 'var(--shadow)',
                overflow: 'hidden',
                padding: '20px'
              }}
            >
              <h2 className="sidebar-title" style={{
                margin: '0 0 12px',
                color: 'var(--text-primary)',
                font: '800 0.75rem/1.3 "Manrope", sans-serif',
                letterSpacing: '0.22em',
                textTransform: 'uppercase'
              }}>
                Feeds
              </h2>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <a 
                  href="#"
                  onClick={(e) => { e.preventDefault(); alert("RSS Feed link: Under Construction."); }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '999px',
                    padding: '4px 10px',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    textDecoration: 'none'
                  }}
                >
                  <BookOpen size={10} />
                  <span>Posts Feed</span>
                </a>
                <a 
                  href="#"
                  onClick={(e) => { e.preventDefault(); alert("Comments RSS Feed: Under Construction."); }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '999px',
                    padding: '4px 10px',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    textDecoration: 'none'
                  }}
                >
                  <MessageSquare size={10} />
                  <span>Comments Feed</span>
                </a>
              </div>
            </div>

          </div>

        </div>

        {/* FOOTER */}
        <div id="footer" style={{ marginTop: '20px' }}>
          <div style={{
            borderRadius: '26px',
            backgroundColor: '#1f352e',
            color: '#fef7ee',
            padding: '22px 24px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, color: 'rgba(254, 247, 238, 0.76)', fontSize: '0.78rem' }}>
              Rounders Magazine Custom Blogger Theme. Integrated into Veteran VR&E Portal. &copy; 2026. All Rights Reserved.
            </p>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

export default AdvisoryBlogView;
