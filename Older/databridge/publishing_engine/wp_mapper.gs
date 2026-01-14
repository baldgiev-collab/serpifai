function WP_map(post){
  var tags=[], category='General';
  if(post.topic){ var t=String(post.topic).toLowerCase();
    if(/guide|how to|tutorial/.test(t)) tags.push('how-to');
    if(/compare|vs|alternatives/.test(t)) tags.push('comparison');
    if(/tools|stack|software/.test(t)) tags.push('tools');
  }
  if(post.pillar){ category = post.pillar.charAt(0).toUpperCase()+post.pillar.slice(1); }
  return {category:category, tags:Helpers_unique_(tags)};
}
