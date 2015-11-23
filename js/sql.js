var sql = {
	CREATE : "CREATE TABLE IF NOT EXISTS cot_admin ("+
			"id integer primary key autoincrement,"+
			"observer_name VARCHAR(100)  NOT NULL ,"+
			"observer_tel VARCHAR(100)  NOT NULL ,"+
			"observer_email VARCHAR(100)  NOT NULL ,"+
			"observation_date VARCHAR(100) NOT NULL ,"+
			"observation_location TEXT NOT NULL ,"+
			"observation_localisation VARCHAR(100) NOT NULL ,"+
			"observation_region VARCHAR(100) NOT NULL ,"+
			"observation_country VARCHAR(100) NOT NULL ,"+
			"observation_country_code VARCHAR(100) NOT NULL ,"+
			"observation_latitude VARCHAR(100) NOT NULL ,"+
			"observation_longitude VARCHAR(100) NOT NULL ,"+
			"observation_number VARCHAR(100)  NOT NULL ,"+
			"observation_culled INT(11)  NOT NULL ,"+
			"observation_state VARCHAR(100) NOT NULL ,"+
			"counting_method_timed_swim VARCHAR(100)  NOT NULL,"+
			"counting_method_distance_swim VARCHAR(100)  NOT NULL,"+
			"counting_method_other VARCHAR(100)  NOT NULL,"+
			"depth_range VARCHAR(100)  NOT NULL,"+
			"observation_method VARCHAR(100)  NOT NULL,"+
			"remarks TEXT NOT NULL,"+
			"localisation POINT NOT NULL ,"+
			"admin_validation BOOLEAN NOT NULL default 0,"+
			"status VARCHAR(100)"+
		");",
	SELECT : "SELECT id, observer_name, observer_tel, observer_email, observation_date, observation_location, observation_localisation, observation_region, observation_country, observation_country_code, observation_latitude, observation_longitude, observation_number, observation_culled, observation_state, counting_method_timed_swim, counting_method_distance_swim, counting_method_other, depth_range, observation_method, remarks, localisation, admin_validation, status FROM cot_admin where status<>'synchronized'",
	INSERT : "INSERT INTO cot_admin(id, observer_name, observer_tel, observer_email, observation_date, observation_location, observation_localisation, observation_region, observation_country, observation_country_code, observation_latitude, observation_longitude, observation_number, observation_culled, observation_state, counting_method_timed_swim, counting_method_distance_swim, counting_method_other, depth_range, observation_method, remarks, localisation, admin_validation, status) VALUES (null, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'local')",
	UPDATE : "UPDATE cot_admin set status='synchronized' where id=?",
	DELETE : "DELETE from cot_admin"
}
