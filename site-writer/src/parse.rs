use rss::Channel;

pub async fn parse(rssFeed: String) -> Result<Channel, Box<dyn Error>> {
    let content = reqwest::get(rssFeed)
        .await?
        .bytes()
        .await?;


    let channel = Channel::read_from(&content[..])?;

    Ok(channel)
}
