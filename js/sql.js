var sql = {
	CREATE : "CREATE TABLE IF NOT EXISTS cot_admin ("+
			"id integer primary key autoincrement,"+
			"observer_name VARCHAR(100)  NOT NULL ,"+
			"observer_tel VARCHAR(100)  NOT NULL ,"+
			"observer_email VARCHAR(100)  NOT NULL ,"+
			"observation_day INT(2),"+
			"observation_month INT(2),"+
			"observation_year INT(4) NOT NULL,"+
			"observation_location TEXT NOT NULL ,"+
			"observation_localisation VARCHAR(100) NOT NULL ,"+
			"observation_region VARCHAR(100) NOT NULL ,"+
			"observation_country VARCHAR(100) NOT NULL ,"+
			"observation_latitude VARCHAR(100) NOT NULL ,"+
			"observation_longitude VARCHAR(100) NOT NULL ,"+
			"observation_number VARCHAR(100)  NOT NULL ,"+
			"observation_culled INT(11)  NOT NULL ,"+
			"counting_method_timed_swim VARCHAR(100)  NOT NULL,"+
			"counting_method_distance_swim VARCHAR(100)  NOT NULL,"+
			"counting_method_other VARCHAR(100)  NOT NULL,"+
			"depth_range VARCHAR(100)  NOT NULL,"+
			"observation_method VARCHAR(100)  NOT NULL,"+
			"remarks TEXT NOT NULL,"+
			"admin_validation BOOLEAN NOT NULL default 0,"+
			"status VARCHAR(100),"+
			"date_enregistrement TEXT NOT NULL"+
		");",
	SELECT : "SELECT id, observer_name, observer_tel, observer_email, observation_day, observation_month, observation_year, observation_location, observation_localisation, observation_region, observation_country, observation_latitude, observation_longitude, observation_number, observation_culled, counting_method_timed_swim, counting_method_distance_swim, counting_method_other, depth_range, observation_method, remarks, admin_validation, status FROM cot_admin where id = ?;",
	SELECTexistLIST : "SELECT * FROM cot_admin;",
	SELECTidINSERT : "SELECT id FROM cot_admin where observer_name=? and observer_tel=? and observer_email=? and observation_day=? and observation_month=? and observation_year=? and observation_location=? and observation_localisation=? and observation_region=? and observation_country=? and observation_latitude=? and observation_longitude=? and observation_number=? and observation_culled=? and counting_method_timed_swim=? and counting_method_distance_swim=? and counting_method_other=? and depth_range=? and observation_method=? and remarks=? and date_enregistrement=?;",
	SELECTCOTLIST : "SELECT id, observation_day, observation_month, observation_year, observation_location, observation_localisation, observation_number, date_enregistrement FROM cot_admin where status<>'synchronized';",
	SELECTreditCOTForm : "SELECT id, observer_name, observer_tel, observer_email, observation_day, observation_month, observation_year, observation_location, observation_localisation, observation_region, observation_country, observation_latitude, observation_longitude, observation_number, observation_culled, counting_method_timed_swim, counting_method_distance_swim, counting_method_other, depth_range, observation_method, remarks FROM cot_admin WHERE id = ? ;",
	INSERT : "INSERT INTO cot_admin(id, observer_name, observer_tel, observer_email, observation_day, observation_month, observation_year, observation_location, observation_localisation, observation_region, observation_country, observation_latitude, observation_longitude, observation_number, observation_culled, counting_method_timed_swim, counting_method_distance_swim, counting_method_other, depth_range, observation_method, remarks, status, date_enregistrement) VALUES (null, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'local', ?);",
	UPDATEFORM : "UPDATE cot_admin set observer_name=?, observer_tel=?, observer_email=?, observation_day=?, observation_month=?, observation_year=?, observation_location=?, observation_localisation=?, observation_region=?, observation_country=?, observation_latitude=?, observation_longitude=?, observation_number=?, observation_culled=?, counting_method_timed_swim=?, counting_method_distance_swim=?, counting_method_other=?, depth_range=?, observation_method=?, remarks=? where id=?;",
	UPDATE : "UPDATE cot_admin set status = 'synchronized' where id = ?;",
	REMOVE : "DELETE FROM cot_admin where id = ?;",
	DROP: "DROP TABLE cot_admin;",
	DELETE : "DELETE from cot_admin;"
}
